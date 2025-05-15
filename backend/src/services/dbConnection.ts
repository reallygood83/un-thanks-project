import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/un-thanks-project';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'un-thanks-project';
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5초

// MongoDB 연결 함수
export const connectToDatabase = async (): Promise<void> => {
  let retries = 0;
  const tryConnect = async () => {
    try {
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: MONGODB_DB_NAME
      };

      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB:', MONGODB_DB_NAME);
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      
      if (retries < MAX_RETRIES) {
        retries++;
        console.log(`⏱️ 연결 재시도 중... (${retries}/${MAX_RETRIES})`);
        setTimeout(tryConnect, RETRY_INTERVAL);
      } else {
        console.error(`⛔ MongoDB 연결 시도 ${MAX_RETRIES}회 실패, 서버가 제한된 기능으로 실행됩니다.`);
        throw error; // 최대 재시도 후에도 실패하면 오류 발생
      }
    }
  };

  await tryConnect();
};

// 연결 이벤트 리스너
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  
  // 연결이 끊어진 경우 재연결 시도
  if (mongoose.connection.readyState === 0) {
    console.log('📡 MongoDB 재연결 시도 중...');
    connectToDatabase().catch(err => {
      console.error('MongoDB 재연결 실패:', err);
    });
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  console.log('📡 MongoDB 재연결 시도 중...');
  connectToDatabase().catch(err => {
    console.error('MongoDB 재연결 실패:', err);
  });
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB reconnected');
});

// 프로세스 종료 시 연결 종료
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default mongoose.connection;
