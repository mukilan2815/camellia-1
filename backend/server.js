// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // Ensure you have a db.js file in config

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:19006', // Replace with your frontend's URL (Expo's default)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Root Route
app.get('/', (req, res) => {
  res.send('Camellia Backend Server');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
