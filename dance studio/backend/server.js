const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const registrationRoutes = require('./routes/registrationRoutes');
const studentRoutes = require('./routes/studentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const server = http.createServer(app);

// Dynamic CORS based on environment
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000;

// Export io so it can be used in controllers
app.set('socketio', io);

// Middleware
app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dance-studio';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB:', MONGODB_URI))
  .catch(err => {
    console.error('❌ Could not connect to MongoDB:', err.message);
    process.exit(1);
  });

// Socket connection
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

// Routes
app.use('/api', registrationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    realtime: 'enabled',
    message: 'Dance Studio API is running with Socket.io'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Server error' });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
