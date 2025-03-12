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

            // Insert the game
            const gameResult = await client.query(
                `INSERT INTO games (id, game_code, admin_user_id, created_at, has_started) 
                 VALUES ($1, $2, $3, NOW(), FALSE) 
                 RETURNING *`,
                [gameId, gameCode, userId],
            );

            // Insert admin user into user_games
            await client.query(
                `INSERT INTO user_games (game_id, user_id, role_id) 
                 VALUES ($1, $2, 1)`,
                [gameId, userId],
            );

            // Initialize scoring for 4 quarters
            for (let q = 1; q <= 4; q++) {
                await client.query(
                    `INSERT INTO game_scoring (game_id, quarter, is_live, home_team_score, away_team_score, winner, has_ended) 
         VALUES ($1, $2, FALSE, 0, 0, '', FALSE)`,
                    [gameId, q],
                );
            }

            await client.query('COMMIT');

            const game = gameResult.rows[0];

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
                console.log(`Checking if game ${gameId} exists...`);

                const gameCheck = await client.query(
                    `SELECT id FROM games WHERE id = $1`,
                    [gameId],
                );

                console.log('Game exists:', gameCheck.rows.length > 0);

                if (gameCheck.rows.length > 0) {
                    console.log(
                        `Inserting user ${userId} into user_games with role ${defaultRoleId}...`,
                    );

                    await client.query(
                        `INSERT INTO user_games (id, user_id, game_id, role_id, created_at) 
                         VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
                        [userId, gameId, defaultRoleId],
                    );

                    console.log('User successfully linked to game!');
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

// Fetch Game
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

        const actualUserId = userResult.rows[0].id; // Internal `users.id`

        // Step 2: Check if user is linked via `user_games` OR is `admin_user_id`
        const userGameResult = await pool.query(
            `SELECT role_id FROM user_games WHERE user_id = $1 AND game_id = $2`,
            [actualUserId, gameId],
        );

        let roleId = null;

        if (userGameResult.rows.length) {
            roleId = userGameResult.rows[0].role_id;
        } else {
            // Check if the user is the game admin
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

            roleId = 1; // Admin role
        }

        // Step 3: Fetch game details, including `has_started`
        const gameResult = await pool.query(
            `SELECT * FROM games WHERE id = $1`,
            [gameId],
        );

        if (!gameResult.rows.length) {
            console.log(`Game ${gameId} not found`);
            return res.status(404).json({ error: 'Game not found' });
        }

        // Step 4: Fetch game scoring details
        const scoringResult = await pool.query(
            `SELECT quarter, is_live, home_team_score, away_team_score, winner
             FROM game_scoring WHERE game_id = $1
             ORDER BY quarter ASC`,
            [gameId],
        );

        const scoring = scoringResult.rows.map((row) => ({
            isLive: row.is_live,
            homeTeam: row.home_team_score,
            awayTeam: row.away_team_score,
            winner: row.winner,
        }));

        res.json(
            toCamelCase({
                ...gameResult.rows[0],
                roleId,
                scoring,
            }),
        );
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

        // Fetch game details including has_started, saved_settings, and axis numbers
        const gameResult = await pool.query(
            `SELECT id, game_code, saved_settings, has_started, x_axis_numbers, y_axis_numbers 
             FROM games WHERE id = $1`,
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

        // Fetch players and their selection counts
        const playersResult = await pool.query(
            `SELECT 
                ug.user_id, 
                u.username, 
                ug.role_id, 
                u.has_paid, 
                COALESCE(s.selection_count, 0) AS selection_count
            FROM user_games ug
            JOIN users u ON ug.user_id = u.id
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS selection_count
                FROM selections 
                WHERE game_id = $1
                GROUP BY user_id
            ) s ON ug.user_id = s.user_id
            WHERE ug.game_id = $1`,
            [gameId],
        );

        // Fetch all square selections for the game
        const selectionsResult = await pool.query(
            `SELECT square_id, user_id FROM selections WHERE game_id = $1`,
            [gameId],
        );

        // Fetch game scoring details
        const scoringResult = await pool.query(
            `SELECT quarter, is_live, home_team_score, away_team_score, winner, has_ended
             FROM game_scoring WHERE game_id = $1
             ORDER BY quarter ASC`,
            [gameId],
        );

        // Map scoring results
        const scoring = scoringResult.rows.map((row) => ({
            quarter: row.quarter,
            isLive: row.is_live,
            homeTeam: row.home_team_score,
            awayTeam: row.away_team_score,
            winner: row.winner,
            hasEnded: row.has_ended,
        }));

        res.json(
            toCamelCase({
                gameId: gameResult.rows[0].id,
                gameCode: gameResult.rows[0].game_code,
                settings: gameResult.rows[0].saved_settings ?? {},
                hasStarted: gameResult.rows[0].has_started,
                xAxisNumbers: gameResult.rows[0].x_axis_numbers, // Include x_axis_numbers
                yAxisNumbers: gameResult.rows[0].y_axis_numbers, // Include y_axis_numbers
                roleId: userRoleResult.rows[0].role_id,
                players: playersResult.rows.map((player) => ({
                    userId: player.user_id,
                    username: player.username,
                    roleId: player.role_id,
                    hasPaid: player.has_paid ?? 0,
                    selectionCount: player.selection_count,
                })),
                selections: selectionsResult.rows.map((selection) => ({
                    squareId: selection.square_id,
                    userId: selection.user_id,
                })),
                scoring, // Include scoring data
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
            'UPDATE users SET has_paid = $1 WHERE id = $2 RETURNING *',
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

// Start Game
app.post('/api/games/:gameId/start', async (req, res) => {
    const { gameId } = req.params;

    try {
        await pool.query('BEGIN'); // Start transaction

        // Update game to started
        const updateGameResult = await pool.query(
            `UPDATE games SET has_started = TRUE WHERE id = $1 RETURNING *`,
            [gameId],
        );

        if (!updateGameResult.rows.length) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Game not found' });
        }

        // Set Quarter 1 as live
        const updateQuarterResult = await pool.query(
            `UPDATE game_scoring SET is_live = TRUE WHERE game_id = $1 AND quarter = 1 RETURNING *`,
            [gameId],
        );

        if (!updateQuarterResult.rows.length) {
            await pool.query('ROLLBACK');
            return res
                .status(404)
                .json({ error: 'No quarter data found for this game' });
        }

        await pool.query('COMMIT'); // Commit transaction

        res.json(
            toCamelCase({
                hasStarted: updateGameResult.rows[0].has_started,
                currentQuarter: updateQuarterResult.rows[0].quarter,
                isLive: updateQuarterResult.rows[0].is_live,
            }),
        );
    } catch (err) {
        await pool.query('ROLLBACK'); // Rollback transaction on error
        console.error('Error starting game:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Updating score / End Quarter
app.put('/api/games/:gameId/quarters/:quarter', async (req, res) => {
    const { gameId, quarter } = req.params;
    const { homeTeam, awayTeam, endQuarter } = req.body;

    console.log(`Updating quarter ${quarter} for game ${gameId}`);

    try {
        // Update the current quarter's score
        const result = await pool.query(
            `UPDATE game_scoring
             SET home_team_score = COALESCE($1, home_team_score),
                 away_team_score = COALESCE($2, away_team_score)
             WHERE game_id = $3 AND quarter = $4
             RETURNING *`,
            [homeTeam, awayTeam, gameId, quarter],
        );

        if (!result.rows.length) {
            return res
                .status(404)
                .json({ error: 'Quarter not found for this game' });
        }

        let updatedQuarter = result.rows[0]; // Store the updated quarter data
        let responseMessage = 'Score updated';

        // If `endQuarter` is true, mark this quarter as ended
        if (endQuarter) {
            const endResult = await pool.query(
                `UPDATE game_scoring    
                 SET is_live = false, has_ended = true
                 WHERE game_id = $1 AND quarter = $2
                 RETURNING *`,
                [gameId, quarter],
            );

            if (endResult.rows.length) {
                updatedQuarter = endResult.rows[0]; // Update quarter with new status
            }

            // Start next quarter if it exists
            const nextQuarter = parseInt(quarter) + 1;
            const nextQuarterResult = await pool.query(
                `SELECT * FROM game_scoring
                 WHERE game_id = $1 AND quarter = $2`,
                [gameId, nextQuarter],
            );

            if (nextQuarterResult.rows.length) {
                // Carry over the score from the previous quarter
                const { home_team_score, away_team_score } = updatedQuarter;

                await pool.query(
                    `UPDATE game_scoring
                     SET is_live = true,
                         home_team_score = $1,
                         away_team_score = $2
                     WHERE game_id = $3 AND quarter = $4`,
                    [home_team_score, away_team_score, gameId, nextQuarter],
                );

                responseMessage += `. Quarter ${quarter} ended. Quarter ${nextQuarter} started with scores carried over.`;
            } else {
                responseMessage += `. Quarter ${quarter} ended. No more quarters available.`;
            }
        }

        // Fetch all quarters' scores for the game
        const allQuarters = await pool.query(
            `SELECT quarter, is_live, home_team_score AS home_team, 
                    away_team_score AS away_team, winner, has_ended
             FROM game_scoring
             WHERE game_id = $1
             ORDER BY quarter`,
            [gameId],
        );

        res.json(toCamelCase(allQuarters.rows)); // Return full game scoring
    } catch (err) {
        console.error('Error updating score:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Set axis numbers
app.put('/api/games/:gameId/axis-numbers', async (req, res) => {
    const { gameId } = req.params;
    let { xAxis, yAxis } = req.body;

    // Ensure we pass NULL instead of an empty array
    xAxis = xAxis.length ? xAxis : null;
    yAxis = yAxis.length ? yAxis : null;

    try {
        const result = await pool.query(
            `UPDATE games 
             SET x_axis_numbers = $1::integer[], y_axis_numbers = $2::integer[]
             WHERE id = $3 RETURNING *`,
            [xAxis, yAxis, gameId],
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json(
            toCamelCase({
                xAxisNumbers: result.rows[0].x_axis_numbers,
                yAxisNumbers: result.rows[0].y_axis_numbers,
            }),
        );
    } catch (err) {
        console.error('Error saving axis numbers:', err);
        res.status(500).json({ error: 'Internal server error' });
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
