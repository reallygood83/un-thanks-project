// MongoDB 연결 모듈 - 서버리스 환경에 최적화
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// 환경 변수에서 MongoDB URI 가져오기
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://unthanks:thanksun@unthanks.mongodb.net/unthanks?retryWrites=true&w=majority';
const MONGODB_DB = process.env.MONGODB_DB || 'unthanks';

// 개발 환경에서만 기본 값 설정
if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn('경고: 개발 환경에서 로컬 MongoDB를 사용합니다. 프로덕션에서는 MONGODB_URI를 설정해야 합니다.');
}

// 전역 변수로 캐싱하여 연결 재사용
let cachedClient = null;
let cachedDb = null;
let cachedMongoose = false;

// 기본 Mongoose 옵션
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // 서버리스 함수에서는 작은 풀 사이즈가 적합
  serverSelectionTimeoutMS: 10000, // 서버 선택 타임아웃 증가
};

// Mongoose로 MongoDB 연결
async function connectMongoose() {
  if (cachedMongoose && mongoose.connection.readyState === 1) {
    console.log('Mongoose: 기존 연결 재사용');
    return mongoose.connection;
  }

  // MongoDB URI가 없는 경우 오류 발생
  if (!MONGODB_URI) {
    throw new Error('환경 변수에 MONGODB_URI가 설정되어 있지 않습니다.');
  }

  try {
    console.log('Mongoose: 새 연결 시도...');
    await mongoose.connect(MONGODB_URI, mongooseOptions);

    cachedMongoose = true;
    console.log('Mongoose: 연결 성공');

    return mongoose.connection;
  } catch (error) {
    console.error('Mongoose 연결 오류:', error);
    cachedMongoose = false;
    throw error;
  }
}

// MongoDB 클라이언트로 직접 연결
async function connectToDatabase() {
  // 이미 연결이 있으면 재사용
  if (cachedClient && cachedDb) {
    console.log('MongoDB: 기존 연결 재사용');
    return { client: cachedClient, db: cachedDb };
  }

  // MongoDB URI가 없는 경우 오류 발생
  if (!MONGODB_URI) {
    throw new Error('환경 변수에 MONGODB_URI가 설정되어 있지 않습니다.');
  }

  // 서버리스 환경에서는 연결 풀링이 효율적
  const options = {
    maxPoolSize: 10,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority'
  };

  // URI 마스킹 (로깅용)
  const maskedUri = MONGODB_URI ? MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:****@') : 'undefined';
  console.log('MongoDB: 연결 시도...', { uri: maskedUri });

  try {
    // 서버리스 환경에서 연결 전략 최적화
    const client = new MongoClient(MONGODB_URI, options);

    await client.connect();
    const db = client.db(MONGODB_DB);

    // 연결 및 데이터베이스 캐싱
    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB: 연결 성공:', {
      database: MONGODB_DB,
      collections: await db.listCollections().toArray().then(cols => cols.map(c => c.name))
    });

    // Mongoose도 연결
    try {
      await connectMongoose();
    } catch (mongooseError) {
      console.warn('Mongoose 연결 실패, MongoDB 클라이언트만 사용:', mongooseError.message);
    }

    return { client, db };
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);

    // 연결 실패 시 캐시 초기화
    cachedClient = null;
    cachedDb = null;

    throw error;
  }
}

// 샘플 데이터 - DB 연결 실패 시 사용
const sampleCountries = [
  {
    _id: 'usa',
    name: '미국 (United States)',
    nameKo: '미국',
    nameEn: 'United States',
    code: 'usa',
    flagCode: 'us',
    participationType: 'combat',
    region: 'North America',
    language: 'en'
  },
  {
    _id: 'uk',
    name: '영국 (United Kingdom)',
    nameKo: '영국',
    nameEn: 'United Kingdom',
    code: 'uk',
    flagCode: 'gb',
    participationType: 'combat',
    region: 'Europe',
    language: 'en'
  },
  {
    _id: 'turkey',
    name: '터키 (Turkey)',
    nameKo: '터키',
    nameEn: 'Turkey',
    code: 'turkey',
    flagCode: 'tr',
    participationType: 'combat',
    region: 'Middle East',
    language: 'tr'
  }
];

const sampleLetters = [
  {
    _id: 'sample-1',
    name: '홍길동',
    school: '서울초등학교',
    grade: '5학년',
    letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
    translatedContent: 'Thank you. I sincerely thank you for helping for the freedom of Korea.',
    countryId: 'usa',
    createdAt: new Date('2025-05-01').toISOString()
  },
  {
    _id: 'sample-2',
    name: '김철수',
    school: '부산중학교',
    grade: '2학년',
    letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
    translatedContent: 'Thank you for your participation. I express deep gratitude for your sacrifice.',
    countryId: 'uk',
    createdAt: new Date('2025-05-02').toISOString()
  }
];

/**
 * 편지 데이터 유효성 검사 - 필수 필드 확인
 * @param {Object} letterData - 편지 데이터
 * @returns {boolean} - 유효성 검사 결과
 */
function validateLetterData(letterData) {
  if (!letterData) return false;
  
  // 필수 필드: 이름, 편지 내용, 국가 ID
  const hasName = letterData.name && typeof letterData.name === 'string' && letterData.name.trim().length > 0;
  const hasContent = letterData.letterContent && typeof letterData.letterContent === 'string' && letterData.letterContent.trim().length > 0;
  const hasCountryId = letterData.countryId && typeof letterData.countryId === 'string' && letterData.countryId.trim().length > 0;
  
  // 이메일 필드 검사 제거 (이메일은 더 이상 필수 필드가 아님)
  
  const isValid = hasName && hasContent && hasCountryId;
  
  if (!isValid) {
    console.log('[MongoDB] 편지 데이터 유효성 검사 실패:', {
      hasName,
      hasContent,
      hasCountryId,
      fields: Object.keys(letterData)
    });
  }
  
  return isValid;
}

// 모듈 내보내기
module.exports = {
  connectToDatabase,
  connectMongoose,
  sampleCountries,
  sampleLetters,
  validateLetterData
};