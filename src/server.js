const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Forces Node to use Google's DNS

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// --- UPDATED CORS SECTION ---
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: allowedOrigin,
  credentials: true, // Allows cookies/headers if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// ----------------------------

app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.resolve("uploads")));

// Connect to DB first, then load routes
connectDB().then(() => {
  const authRoutes = require('./routes/auth-routes');
  const ticketRoutes = require('./routes/ticket-routes');
  const userRoutes = require('./routes/user-routes');

  app.use('/api/auth', authRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/users', userRoutes);

  app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server due to DB error:', error);
});