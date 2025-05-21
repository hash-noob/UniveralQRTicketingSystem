const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Import routes
const passRoutes = require('./routes/passRoutes');
const authRoutes = require('./routes/authRoutes');


// Define routes
app.get('/api/', (req, res) => {
  res.send('Barcode Scanner API is running');
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/passes', passRoutes);

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 