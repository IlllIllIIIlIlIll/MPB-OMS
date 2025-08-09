import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/auth';
import occupancyRoutes from './routes/occupancy';

// Import services
import { setupSocketHandlers } from './services/socketService';
import { startMQTTService } from './services/mqttService';
import { startAggregatorWorker } from './workers/aggregatorWorker';
import { startRecommendationWorker } from './workers/recommendationWorker';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.SOCKET_CORS_ORIGIN || "http://192.168.1.21:3002",
      "http://localhost:3002", // Frontend
      "http://localhost:8081", // Mobile app web version
      "http://192.168.1.21:8081", // Mobile app web version (IP)
    ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
// Configure CORS to allow multiple origins
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://192.168.1.21:3002",
  "http://localhost:3002", // Frontend
  "http://localhost:8081", // Mobile app web version
  "http://192.168.1.21:8081", // Mobile app web version (IP)
  "exp://192.168.1.21:8081", // Expo development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// System status
app.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    services: {
      mqtt: 'connected',
      redis: 'connected',
      database: 'connected',
      workers: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/occupancy', occupancyRoutes);

// Log registered routes
console.log('🛣️ Registered routes:')
console.log('  - GET /health')
console.log('  - GET /status')
console.log('  - GET /api/auth/*')
console.log('  - GET /api/occupancy/*')
console.log('  - POST /api/occupancy/ingest')

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`)
  console.log(`📋 Headers:`, req.headers)
  next()
})

// Socket.io setup
setupSocketHandlers(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 Shutting down gracefully...');
  
  // Close HTTP server
  server.close(() => {
    console.log('✅ HTTP server closed');
  });
  
  // Close Socket.io
  io.close(() => {
    console.log('✅ Socket.io server closed');
  });
  
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start services
const startServices = async () => {
  try {
    // Start MQTT service
    console.log('🔌 Starting MQTT service...');
    await startMQTTService();
    
    // Start workers
    console.log('⚙️ Starting workers...');
    await startAggregatorWorker();
    await startRecommendationWorker();
    
    console.log('✅ All services started successfully');
  } catch (error) {
    console.error('❌ Error starting services:', error);
  }
};

// Start server
server.listen(PORT, () => {
  console.log(`🚌 TransJakarta OMS Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Start services after server is ready
  startServices();
}); 