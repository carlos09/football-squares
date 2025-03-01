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

            const gameResult = await client.query(
                'INSERT INTO games (id, game_code, admin_user_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
                [gameId, gameCode, userId],
            );

            await client.query(
                'UPDATE users SET game_id = $1, role_id = 1 WHERE user_id = $2',
                [gameId, userId],
            );

            await client.query('COMMIT');

            const game = gameResult.rows[0];

            // Format the response
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

// Get a game
app.get('/api/games/:url_id', async (req, res) => {
    try {
        const { url_id } = req.params;
        const result = await pool.query(
            'SELECT * FROM games WHERE url_id = $1',
            [url_id],
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/create', async (req, res) => {
    console.log('Request received at /api/users/create', req.body);
    try {
        const { gameId, username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: {
                    message: 'Missing required fields: username and password.',
                },
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = crypto.randomUUID();

        let assignedGameId = gameId || null;
        let roleId = 1; // Default to admin if no gameId is provided

        if (gameId) {
            // If a gameId is provided, check if the username is already taken
            const existingUser = await pool.query(
                'SELECT 1 FROM users WHERE game_id = $1 AND username = $2 LIMIT 1',
                [gameId, username],
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    error: { message: 'Username already taken in this game.' },
                });
            }

            // Check if there's already an admin for this game
            const existingAdmin = await pool.query(
                'SELECT 1 FROM users WHERE game_id = $1 AND role_id = 1 LIMIT 1',
                [gameId],
            );

            if (existingAdmin.rows.length > 0) {
                roleId = 2; // Default to player role if an admin exists
            }
        }

        /// Insert user
        const result = await pool.query(
            `INSERT INTO users (game_id, username, password, user_id, role_id) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, user_id, role_id`,
            [gameId, username, hashedPassword, userId, roleId],
        );

        const insertedUserId = result.rows[0].id;

        // ✅ Ensure the user is linked to the game in `user_games`
        await pool.query(
            `INSERT INTO user_games (user_id, game_id, role_id, created_at) 
     VALUES ($1, $2, $3, NOW())`,
            [insertedUserId, gameId, roleId],
        );

        const user = result.rows[0];

        res.json(toCamelCase(user));
    } catch (err) {
        console.error('Error in /api/users/create:', err);
        res.status(500).json({
            error: { message: err.message || 'An error occurred' },
        });
    }
});

app.post('/create-game', async (req, res) => {
    const gameId = crypto.randomUUID();
    const adminUserId = crypto.randomUUID(); // Admin user ID

    try {
        console.log(`Creating game with ID: ${gameId}`);

        // Insert into games
        await pool.query(
            'INSERT INTO games (id, created_at) VALUES ($1, NOW())',
            [gameId],
        );

        // Ensure role exists and get the role ID
        const roleQuery = await pool.query(
            "SELECT id FROM roles WHERE name = 'gameAdmin' LIMIT 1",
        );
        const roleId = roleQuery.rows[0]?.id || 1; // Fallback to 1 if no role found

        // Insert admin user into users table
        const result = await pool.query(
            `INSERT INTO users (user_id, game_id, username, role_id)
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, game_id, role_id`,
            [adminUserId, gameId, 'adminUser', roleId], // Ensure game_id is correctly assigned
        );

        await pool.query(
            `INSERT INTO user_games (user_id, game_id, role_id, created_at)
             VALUES ($1, $2, (SELECT id FROM roles WHERE name = 'gameAdmin'), NOW())`,
            [adminUserId, gameId],
        );

        const user = result.rows[0];

        res.json({
            success: true,
            gameId,
            adminUserId: user.user_id,
            role: user.role_id,
        });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/game/:gameCode', async (req, res) => {
    const { gameCode } = req.params;
    console.log(`Request received to fetch gameId for gameCode: ${gameCode}`);

    try {
        const result = await pool.query(
            'SELECT id FROM games WHERE game_code = $1',
            [gameCode],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({ gameId: result.rows[0].id });
    } catch (err) {
        console.error(`Error in /api/game/:gameCode:`, err);
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

app.get('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`Fetching user with userId: ${userId}`);

    try {
        // Fetch user data with role name
        const userResult = await pool.query(
            `SELECT u.*, r.name as role
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.user_id = $1;`,
            [userId],
        );

        if (!userResult.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch games associated with the user
        const gamesResult = await pool.query(
            `SELECT g.* 
             FROM games g
             LEFT JOIN user_games ug ON g.id = ug.game_id
             WHERE g.admin_user_id = $1 OR ug.user_id = $1`,
            [userId],
        );

        // Construct response
        const response = {
            user: userResult.rows[0],
            games: gamesResult.rows || [],
        };

        console.log('API Response:', JSON.stringify(response, null, 2));

        res.setHeader('Content-Type', 'application/json');

        res.json(toCamelCase(response));
    } catch (err) {
        console.error('Error fetching user and games:', err);
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

// app.get('/api/games/:gameId/selected-squares', async (req, res) => {
//     try {
//         const gameId = req.params.gameId;
//         const game = await getGame(gameId);

//         if (!game) {
//             return res.status(404).json({ error: 'Game not found' });
//         }

//         // Process game data and return the selected squares
//         res.json({ selectedSquares: game.selected_squares });
//     } catch (error) {
//         console.error('Error fetching selected squares:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

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
