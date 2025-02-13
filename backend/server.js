require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5001;

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.send("Football Squares API is running!");
});

// Create a game
app.post("/games", async (req, res) => {
  try {
    const { game_id, url_id } = req.body;
    const result = await pool.query(
      "INSERT INTO games (game_id, url_id) VALUES ($1, $2) RETURNING *",
      [game_id, url_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a game
app.get("/games/:url_id", async (req, res) => {
  try {
    const { url_id } = req.params;
    const result = await pool.query("SELECT * FROM games WHERE url_id = $1", [
      url_id,
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
