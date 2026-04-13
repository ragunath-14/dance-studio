const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);

// Dedicated registration endpoint
const studentController = require('./controllers/studentController');
app.post('/api/register', studentController.createStudent);

app.get('/api/register', (req, res) => {
  res.send('Dance Studio Admin API is running...');
});

// Serve frontend in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/admin/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'admin', 'dist', 'index.html'));
  });
}

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dance-studio';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Setup socket connection handler
    io.on('connection', (socket) => {
      console.log('⚡ New admin client connected:', socket.id);
      socket.on('disconnect', () => console.log('🔌 Admin client disconnected'));
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

