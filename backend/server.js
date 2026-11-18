const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bookRoutes = require('./routes/books');
const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/books', bookRoutes);
app.use('/transactions', transactionRoutes);
app.use('/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Library Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
