// MongoDB 연결 모듈 - 서버리스 환경에 최적화
const { MongoClient } = require('mongodb');

// 환경 변수에서 MongoDB URI 가져오기
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'un-thanks-project';

// 개발 환경에서만 기본 값 설정
if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn('경고: 개발 환경에서 로컬 MongoDB를 사용합니다. 프로덕션에서는 MONGODB_URI를 설정해야 합니다.');
}

// 전역 변수로 캐싱하여 연결 재사용
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // 이미 연결이 있으면 재사용
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // MongoDB URI가 없는 경우 오류 발생
  if (!MONGODB_URI) {
    throw new Error('환경 변수에 MONGODB_URI가 설정되어 있지 않습니다.');
  }

  // 서버리스 환경에서는 연결 풀링이 효율적
  const options = {
    maxPoolSize: 10, // 서버리스 함수에서는 작은 풀 사이즈가 적합
    connectTimeoutMS: 10000, // 연결 타임아웃 증가
    socketTimeoutMS: 45000, // 소켓 타임아웃 설정
    serverSelectionTimeoutMS: 10000, // 서버 선택 타임아웃 증가
    retryWrites: true,
    w: 'majority'
  };

  console.log('MongoDB 연결 시도...', {
    uri: MONGODB_URI ? MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:****@') : 'undefined'
  });

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

// 모듈 내보내기
module.exports = {
  connectToDatabase
};