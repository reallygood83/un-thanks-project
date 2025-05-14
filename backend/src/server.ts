import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

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

// Connect to MongoDB
connectToDatabase();

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
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

export default app;