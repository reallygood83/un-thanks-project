// MongoDB 연결 모듈
const { MongoClient } = require('mongodb');

// MongoDB 연결 URI (환경 변수에서 가져옴)
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'un-thanks-db';

// MongoDB 연결 클라이언트 캐싱
let cachedClient = null;
let cachedDb = null;

// 데이터베이스 연결 함수
async function connectToDatabase() {
  // 캐시된 연결이 있으면 재사용
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // 연결 URI가 없는 경우 오류 발생
  if (!MONGODB_URI) {
    throw new Error('MongoDB 연결 URI가 설정되지 않았습니다. MONGODB_URI 환경 변수를 확인하세요.');
  }

  // MongoDB에 연결
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10
    });

    const db = client.db(DB_NAME);
    
    // 연결 성공시 캐싱
    cachedClient = client;
    cachedDb = db;
    
    console.log(`MongoDB 연결 성공: ${DB_NAME}`);
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    throw error;
  }
}

module.exports = { connectToDatabase };