require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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

// Create a game
app.post('/api/games', async (req, res) => {
    console.log('hitting /games');
    try {
        const gameId = crypto.randomUUID();
        const urlId = req.body.url_id || crypto.randomUUID(); // Generate URL ID if missing

        const result = await pool.query(
            'INSERT INTO games (id, url_id) VALUES ($1, $2) RETURNING *',
            [gameId, urlId],
        );
        res.set('Server-Timing', `endpoint-name;desc="Create Game "`);
        res.json({ gameId: result.rows[0].id, url_id: result.rows[0].url_id });
    } catch (err) {
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

app.post('/api/users', async (req, res) => {
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
        res.json(result.rows[0]); // Ensure response includes user_id
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
    const gameId = crypto.randomUUID(); // Generate unique game ID
    try {
        console.log(`Creating game with ID: ${gameId}`);

        const result = await pool.query(
            'INSERT INTO games (id, created_at) VALUES ($1, NOW()) RETURNING *',
            [gameId],
        );

        res.set('Server-Timing', `endpoint-name;desc="Create Game"`);
        res.json({ success: true, gameId });
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
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
    try {
        const { userId } = req.params;
        const result = await pool.query(
            'SELECT username FROM users WHERE user_id = $1',
            [userId],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.set('Server-Timing', `endpoint-name;desc="Get User"`);
        res.setHeader('Content-Type', 'application/json'); // Ensure JSON response
        res.json(result.rows[0]); // Send JSON response
    } catch (err) {
        res.status(500).json({ error: 'An error occurred' });
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

app.get('/api/selections/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const query = `SELECT * FROM selections WHERE user_id = $1`;
        const result = await pool.query(query, [userId]);

        res.set('Server-Timing', `endpoint-name;desc="Get User Selections"`);
        res.json({ selections: result.rows });
    } catch (error) {
        console.error('Error fetching selections:', error);
        res.status(500).json({ error: error.message });
    }
});
