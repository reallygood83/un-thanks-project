import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Database connection
import { connectToDatabase } from './services/dbConnection';

// Routes
import countryRoutes from './routes/countries';
import letterRoutes from './routes/letters';
import apiRoutes from './routes/api';
import surveyRoutes from './routes/surveys';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB - 서버 시작 전 필수 연결
(async () => {
  try {
    await connectToDatabase();
    startServer();
  } catch (error) {
    console.error('치명적인 MongoDB 연결 오류가 발생했습니다. 서버를 종료합니다.');
    console.error(error);
    process.exit(1); // 연결 실패 시 서버 종료
  }
})();

// 서버 시작 함수
function startServer(): void {
  // Middleware
  // CORS 설정 - 모든 출처에서의 요청 허용
  app.use(cors({
    origin: ['http://localhost:3000', 'https://un-thanks-project.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Helmet 보안 헤더 설정 - CORS와 충돌하지 않도록 설정
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  app.use(morgan('dev'));
  app.use(express.json());

  // Routes
  app.use('/api/countries', countryRoutes);
  app.use('/api/letters', letterRoutes);
  app.use('/api/surveys', surveyRoutes);
  app.use('/api', apiRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running',
      database: {
        status: dbStatus,
        url: process.env.MONGODB_URI ? '(설정됨)' : '(설정되지 않음)'
      }
    });
  });

  // MongoDB 상태 확인 엔드포인트
  app.get('/api/database/status', (req, res) => {
    const statuses: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const readyState = mongoose.connection.readyState;
    const status = statuses[readyState] || 'unknown';
    
    res.status(200).json({
      status,
      readyState,
      dbName: mongoose.connection.db?.databaseName || null,
      host: mongoose.connection.host || null,
      models: Object.keys(mongoose.models),
      hasEnvVars: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        MONGODB_DB_NAME: !!process.env.MONGODB_DB_NAME
      }
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`MongoDB status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
  });
}

export default app;