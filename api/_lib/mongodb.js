// MongoDB 연결 모듈 - 서버리스 환경에 최적화
import { MongoClient } from 'mongodb';

// 환경 변수에서 MongoDB URI 가져오기
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/un-thanks-project';
const MONGODB_DB = process.env.MONGODB_DB || 'un-thanks-project';

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
  const options = {
    maxPoolSize: 10, // 서버리스 함수에서는 작은 풀 사이즈가 적합
    connectTimeoutMS: 10000, // 연결 타임아웃 증가
    socketTimeoutMS: 45000, // 소켓 타임아웃 설정
    serverSelectionTimeoutMS: 10000, // 서버 선택 타임아웃 증가
    ssl: true, // SSL 사용
    tlsAllowInvalidCertificates: true, // 개발 환경을 위한 설정. 프로덕션에서는 false로 설정
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  console.log('MongoDB 연결 시도...', { uri: MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@') });

  try {
    // 서버리스 환경에서 연결 전략 최적화
    const client = new MongoClient(MONGODB_URI, options);
    
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    // 연결 및 데이터베이스 캐싱
    cachedClient = client;
    cachedDb = db;
    
    console.log('MongoDB 연결 성공:', {
      database: MONGODB_DB,
      collections: await db.listCollections().toArray().then(cols => cols.map(c => c.name))
    });
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    
    // 연결 실패 시 캐시 초기화
    cachedClient = null;
    cachedDb = null;
    
    throw error;
  }
}