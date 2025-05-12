// MongoDB 연결 모듈 - 서버리스 환경에 최적화
import { MongoClient } from 'mongodb';

// 환경 변수에서 MongoDB URI 가져오기
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'un-thanks-project';

// 연결이 없는 경우 에러 발생
if (!MONGODB_URI) {
  throw new Error('환경 변수에 MONGODB_URI가 설정되어 있지 않습니다.');
}

// 전역 변수로 캐싱하여 연결 재사용
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // 이미 연결이 있으면 재사용
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // 서버리스 환경에서는 연결 풀링이 효율적
  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10, // 서버리스 함수에서는 작은 풀 사이즈가 적합
    connectTimeoutMS: 5000, // 연결 타임아웃 설정
    serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃
  });

  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    // 연결 캐싱
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    throw error;
  }
}