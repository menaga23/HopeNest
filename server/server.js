const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS allowances for the client application
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder (fallback folder for local image storage)
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// Import Route Routers
const authRoutes = require('./routes/auth');
const orphanageRoutes = require('./routes/orphanages');
const childrenRoutes = require('./routes/children');
const donationRoutes = require('./routes/donations');
const volunteerRoutes = require('./routes/volunteers');
const adoptionRoutes = require('./routes/adoptions');
const impactRoutes = require('./routes/impact');

// Register Route Routers
app.use('/api/auth', authRoutes);
app.use('/api/orphanages', orphanageRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/impact', impactRoutes);

// Simple ping route to verify server execution
app.get('/', (req, res) => {
  res.json({ message: "Welcome to HopeNest API Server - Running Successfully!" });
});

// Make socket.io instance available globally to routes
app.set('io', io);

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hopenest";

// Mask password for safe logging
const maskedURI = MONGODB_URI.includes('@')
  ? MONGODB_URI.replace(/:([^:@]+)@/, ':****@')
  : MONGODB_URI;

console.log(`Attempting to connect to database at: ${maskedURI}`);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Database connection failed at URI: ${maskedURI}. Error:`, err.message);
    console.log("Please check your database server status or connection configuration.");
  });

