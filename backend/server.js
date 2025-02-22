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
    console.log('hitting /games/create');
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const gameId = crypto.randomUUID();
        const gameCode = Math.random().toString(36).substr(2, 6).toUpperCase();

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const gameResult = await client.query(
                'INSERT INTO games (id, game_code, admin_user_id) VALUES ($1, $2, $3) RETURNING *',
                [gameId, gameCode, userId],
            );

            await client.query(
                'UPDATE users SET role_id = (SELECT id FROM roles WHERE name = $1) WHERE id = $2',
                ['gameAdmin', userId],
            );

            await client.query('COMMIT');

            res.json({
                gameId: gameResult.rows[0].id,
                gameCode: gameResult.rows[0].game_code,
                adminUserId: gameResult.rows[0].admin_user_id,
                role: 'gameAdmin',
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

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.post('/api/users/create', async (req, res) => {
    console.log('Request received at /api/users');
    try {
        const { gameId, username, password } = req.body; // Remove userId from req.body
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password
        const userId = crypto.randomUUID(); // Generate a new user ID

        // Check if the username already exists in the same game
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE game_id = $1 AND username = $2',
            [gameId, username],
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: { message: 'Username already taken in this game.' },
            });
        }

        // Insert new user with generated userId
        const result = await pool.query(
            'INSERT INTO users (game_id, username, password, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [gameId, username, hashedPassword, userId],
        );

        console.log('Response sent:', result.rows[0]);
        res.set('Server-Timing', `endpoint-name;desc="Save User"`);
        res.json({
            userId: result.rows[0].user_id, // Ensure frontend gets the correct format
            username: result.rows[0].username,
        });
    } catch (err) {
        console.error('Error in /api/users:', err); // Log full error

        if (err.code === '23505') {
            // Unique constraint violation
            res.status(400).json({
                error: { message: 'Username or user ID already exists.' },
            });
        } else {
            res.status(500).json({
                error: { message: err.message || 'An error occurred' },
            });
        }
    }
});

app.post('/create-game', async (req, res) => {
    const gameId = crypto.randomUUID();
    const adminUserId = crypto.randomUUID(); // Generate user ID for the admin

    try {
        console.log(`Creating game with ID: ${gameId}`);

        // Insert into games
        await pool.query(
            'INSERT INTO games (id, created_at) VALUES ($1, NOW())',
            [gameId],
        );

        // Insert admin user into users table
        await pool.query(
            `INSERT INTO users (id, game_id, username, role_id)
             VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'gameAdmin'))`,
            [adminUserId, gameId, 'adminUser'], // Change username as needed
        );

        res.json({ success: true, gameId, adminUserId, role: 1 });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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
        res.json(response);
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

            res.json({ message: 'Selections updated successfully' });
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

        const query = `SELECT * FROM selections WHERE user_id = $1 AND game_id = $2`;
        const result = await pool.query(query, [userId, gameId]);

        res.set('Server-Timing', `endpoint-name;desc="Get User Selections"`);
        res.json({ selections: result.rows });
    } catch (error) {
        console.error('Error fetching selections:', error);
        res.status(500).json({ error: error.message });
    }
});
