require('dotenv').config();
// const { checkUserRole } = require('./services/userService');
const ROLES = require('./enums/roles');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
// const db = require('./services/db');

const app = express();
const PORT = process.env.PORT || 5001;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto = require('crypto');

// PostgreSQL Connection
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT,
// });

const pool = new Pool({
    user: 'carlosesquer',
    host: 'localhost',
    database: 'football_squares',
    password: 'Dexter09!',
    port: 5432,
});

app.use(cors());
app.use(express.json());

// Test API
app.get('/', (req, res) => {
    res.send('Football Squares API is running!');
});

function generateGameCode() {
    return crypto.randomBytes(3).toString('hex'); // Generates a 6-character code
}

app.post('/api/game-code', async (req, res) => {
    try {
        const gameCode = generateGameCode();

        const result = await pool.query(
            `INSERT INTO games (game_code) VALUES ($1) RETURNING id, game_code`,
            [gameCode],
        );

        res.json({ id: result.rows[0].id, gameCode: result.rows[0].game_code });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
});

// Create a game
app.post('/api/games/create', async (req, res) => {
    console.log('hitting /games/create', req.body);

    try {
        const { userId } = req.body;

        // Validate userId format
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!userId || !uuidRegex.test(userId)) {
            return res.status(400).json({ error: 'Invalid User ID format' });
        }

        const gameId = crypto.randomUUID();
        const gameCode = Math.random().toString(36).substr(2, 6).toUpperCase();

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1️⃣ Insert the game first
            const gameResult = await client.query(
                `INSERT INTO games (id, game_code, admin_user_id, created_at) 
                 VALUES ($1, $2, $3, NOW()) 
                 RETURNING *`,
                [gameId, gameCode, userId],
            );

            // 2️⃣ Insert the admin user into user_games
            await client.query(
                `INSERT INTO user_games (game_id, user_id, role_id) 
                 VALUES ($1, $2, 1)`,
                [gameId, userId],
            );

            await client.query('COMMIT');

            const game = gameResult.rows[0];

            console.log('game created: ', toCamelCase(game));
            res.json({
                gameId: game.id,
                gameCode: game.game_code,
                adminUserId: game.admin_user_id,
                roleId: 1,
            });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Transaction error:', err);
            res.status(500).json({ error: err.message });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error creating game:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create User
app.post('/api/users/create', async (req, res) => {
    console.log('hitting /users/create', req.body);

    try {
        const { username, password, gameId } = req.body;

        if (!username || !password) {
            return res
                .status(400)
                .json({ error: 'Username and password are required' });
        }

        const userId = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(password, 10);
        const defaultRoleId = 2; // Default to role 2 if not specified

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Insert new user
            const userResult = await client.query(
                `INSERT INTO users (id, username, password, role_id, has_paid, created_at) 
                 VALUES ($1, $2, $3, $4, false, NOW()) RETURNING id, username, role_id`,
                [userId, username, hashedPassword, defaultRoleId],
            );

            const user = userResult.rows[0];

            // If gameId is provided, insert into user_games
            if (gameId) {
                // Check if the game exists
                const gameCheck = await client.query(
                    `SELECT id FROM games WHERE id = $1`,
                    [gameId],
                );

                if (gameCheck.rows.length > 0) {
                    await client.query(
                        `INSERT INTO user_games (id, user_id, game_id, role_id, created_at) 
                         VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
                        [userId, gameId, defaultRoleId],
                    );
                } else {
                    console.warn(
                        `Game ${gameId} not found. Skipping user_games insert.`,
                    );
                }
            }

            await client.query('COMMIT');

            res.json({
                userId: user.id,
                username: user.username,
                roleId: user.role_id ?? defaultRoleId,
                gameId: gameId || null, // Return the gameId if user was added to a game
            });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Transaction error:', err);
            res.status(500).json({ error: err.message });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/game/:gameCode', async (req, res) => {
    const { gameCode } = req.params;
    console.log(`Request received to fetch gameId for gameCode: ${gameCode}`);

    try {
        const result = await pool.query(
            'SELECT id, saved_settings FROM games WHERE game_code = $1',
            [gameCode],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json(result.rows[0]); // Return id and saved_settings
    } catch (err) {
        console.error(`Error in /api/game/:gameCode:`, err);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Saving Game Settings
app.post('/api/game/:gameId/settings', async (req, res) => {
    const { gameId } = req.params;
    const { settings } = req.body;

    console.log(`Request save Game for ${gameId} with:`, settings);

    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Invalid settings format' });
    }

    try {
        const result = await pool.query(
            'UPDATE games SET saved_settings = $1 WHERE id = $2 RETURNING saved_settings',
            [settings, gameId],
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({ settings: result.rows[0].saved_settings });
    } catch (err) {
        console.error(`Error updating settings for game ${gameId}:`, err);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username],
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

const toCamelCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(toCamelCase);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
                letter.toUpperCase(),
            );
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
};

app.get('/api/users/:userId/games/:gameId', async (req, res) => {
    const { userId, gameId } = req.params;
    console.log(`Fetching game for userId: ${userId} and gameId: ${gameId}`);

    try {
        // Step 1: Get `users.id` from `users.user_id`
        const userResult = await pool.query(
            `SELECT id FROM users WHERE user_id = $1`,
            [userId],
        );

        if (!userResult.rows.length) {
            console.log(`User ${userId} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        const actualUserId = userResult.rows[0].id; // The internal `users.id`

        // Step 2: Check if user is linked via `user_games` OR is `admin_user_id`
        const userGameResult = await pool.query(
            `SELECT role_id FROM user_games WHERE user_id = $1 AND game_id = $2`,
            [actualUserId, gameId],
        );

        let roleId = null;

        if (userGameResult.rows.length) {
            roleId = userGameResult.rows[0].role_id; // User found in user_games
        } else {
            // Step 3: Check if user is the game's admin
            const adminCheckResult = await pool.query(
                `SELECT id FROM games WHERE id = $1 AND admin_user_id = $2`,
                [gameId, userId],
            );

            if (!adminCheckResult.rows.length) {
                console.log(
                    `User ${userId} is neither in user_games nor admin of game ${gameId}`,
                );
                return res
                    .status(404)
                    .json({ error: 'User is not part of this game' });
            }

            roleId = 1; // Assume `1` means admin if the user is the game's admin
        }

        // Step 4: Fetch game details
        const gameResult = await pool.query(
            `SELECT * FROM games WHERE id = $1`,
            [gameId],
        );

        if (!gameResult.rows.length) {
            console.log(`Game ${gameId} not found`);
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json(toCamelCase({ ...gameResult.rows[0], roleId }));
    } catch (err) {
        console.error('Error fetching game:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch User by userId
app.get('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`Fetching user with userId: ${userId}`);

    try {
        // Fetch user details (excluding role)
        const userResult = await pool.query(
            `SELECT id, username FROM users WHERE id = $1;`,
            [userId],
        );

        if (!userResult.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch games where user is the admin
        const gameResult = await pool.query(
            `SELECT g.id, g.game_code, g.admin_user_id, g.created_at::TEXT
             FROM games g
             LEFT JOIN user_games ug ON g.id = ug.game_id
             WHERE g.admin_user_id = $1 OR ug.user_id = $1
             GROUP BY g.id;`, // Ensure unique game results
            [userId],
        );

        // Extract user details (without role)
        const user = {
            id: userResult.rows[0].id,
            userId: userResult.rows[0].id,
            username: userResult.rows[0].username,
        };

        // Fetch players for each game
        const games = await Promise.all(
            gameResult.rows.map(async (game) => {
                const playersResult = await pool.query(
                    `SELECT u.id, u.id AS user_id, u.username, ug.role_id
                     FROM user_games ug
                     JOIN users u ON ug.user_id = u.id
                     WHERE ug.game_id = $1;`,
                    [game.id],
                );

                return {
                    id: game.id,
                    gameCode: game.game_code,
                    createdAt: game.created_at,
                    adminUserId: game.admin_user_id,
                    players: playersResult.rows.map((player) => ({
                        id: player.id,
                        userId: player.user_id,
                        username: player.username,
                        role: Number(player.role_id), // Ensure role is a number
                    })),
                };
            }),
        );

        console.log('games: ', toCamelCase(games));

        res.json(toCamelCase({ user, games }));
    } catch (err) {
        console.error('Error fetching user, games, and players:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/save-selection', async (req, res) => {
    try {
        console.log('Received request body:', req.body);

        const { userId, gameId, selectedSquares } = req.body;

        if (!userId || !gameId || !Array.isArray(selectedSquares)) {
            return res
                .status(400)
                .json({ error: 'Missing or invalid required fields' });
        }

        const client = await pool.connect(); // Get a client from the pool

        try {
            await client.query('BEGIN'); // Start transaction

            // Step 1: Remove squares that are no longer selected
            await client.query(
                `DELETE FROM selections 
                WHERE user_id = $1 AND game_id = $2 AND square_id NOT IN (SELECT unnest($3::int[]))`,
                [userId, gameId, selectedSquares],
            );

            // Step 2: Insert new selections (ignore duplicates)
            await client.query(
                `INSERT INTO selections (user_id, game_id, square_id)
                SELECT $1, $2, unnest($3::int[])
                ON CONFLICT (user_id, game_id, square_id) DO NOTHING;`,
                [userId, gameId, selectedSquares],
            );

            await client.query('COMMIT'); // Commit transaction

            // Ensure the response returns an array
            res.json({
                message: 'Selections updated successfully',
                selectedSquares: selectedSquares || [],
            });
        } catch (error) {
            await client.query('ROLLBACK'); // Rollback if any error
            throw error;
        } finally {
            client.release(); // Release the client back to the pool
        }
    } catch (error) {
        console.error('Error saving selections:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/selections/:userId/:gameId', async (req, res) => {
    try {
        const { userId, gameId } = req.params;
        console.log('Received request:', { userId, gameId });

        const query = `SELECT * FROM selections WHERE user_id = $1 AND game_id = $2`;
        const result = await pool.query(query, [userId, gameId]);

        console.log('Query Result:', result.rows); // Log query result

        res.set('Server-Timing', `endpoint-name;desc="Get User Selections"`);
        res.json({ selections: result.rows });
    } catch (error) {
        console.error('Error fetching selections:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fetch game by gameId and userId
app.get('/api/game/:gameId/user/:userId', async (req, res) => {
    const { gameId, userId } = req.params;

    try {
        console.log('Received request to get Current Game:', {
            userId,
            gameId,
        });

        // Fetch game details including saved_settings
        const gameResult = await pool.query(
            `SELECT id, game_code, saved_settings FROM games WHERE id = $1`,
            [gameId],
        );

        if (gameResult.rows.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Fetch user role
        const userRoleResult = await pool.query(
            `SELECT role_id FROM user_games WHERE user_id = $1 AND game_id = $2`,
            [userId, gameId],
        );

        if (userRoleResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found in game' });
        }

        // Fetch players in the game
        const playersResult = await pool.query(
            `SELECT ug.user_id, u.username, ug.role_id, u.has_paid 
             FROM user_games ug
             JOIN users u ON ug.user_id = u.id
             WHERE ug.game_id = $1`,
            [gameId],
        );

        // Fetch all square selections for the game
        const selectionsResult = await pool.query(
            `SELECT square_id, user_id FROM selections WHERE game_id = $1`,
            [gameId],
        );

        res.json(
            toCamelCase({
                gameId: gameResult.rows[0].id,
                gameCode: gameResult.rows[0].game_code,
                settings: gameResult.rows[0].saved_settings ?? {}, // Ensure it's an object or empty
                roleId: userRoleResult.rows[0].role_id,
                players: playersResult.rows.map((player) => ({
                    userId: player.user_id,
                    username: player.username,
                    roleId: player.role_id,
                    hasPaid: player.has_paid ?? 0,
                })),
                selections: selectionsResult.rows.map((selection) => ({
                    squareId: selection.square_id,
                    userId: selection.user_id,
                })),
            }),
        );
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ error: 'Failed to retrieve game data' });
    }
});

app.patch('/api/users/:userId/payment-status', async (req, res) => {
    const { userId } = req.params;
    const { hasPaid } = req.body;

    if (typeof hasPaid !== 'boolean') {
        return res.status(400).json({ error: 'Invalid payment status' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET has_paid = $1 WHERE user_id = $2 RETURNING *',
            [hasPaid, userId],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Payment status updated successfully',
            user: result.rows[0],
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});

async function getGame(gameId) {
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [
        gameId,
    ]);
    return result.rows[0]; // Return the game data
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
