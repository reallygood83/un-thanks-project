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

// 샘플 설문 데이터
const sampleSurveys = [
  {
    _id: 'survey-1',
    title: '미래 통일 한국의 모습에 대한 설문',
    description: '이 설문은 학생들이 생각하는 미래 통일 한국의 모습과 기대에 대해 조사합니다. 여러분의 생각과 의견을 자유롭게 남겨주세요.',
    questions: [
      {
        id: 'q1',
        text: '통일 한국의 가장 큰 장점은 무엇이라고 생각하나요?',
        type: 'text',
        required: true
      },
      {
        id: 'q2',
        text: '통일이 된다면 가장 먼저 방문하고 싶은 북한 지역은 어디인가요?',
        type: 'multipleChoice',
        options: ['평양', '백두산', '금강산', '개성', '신의주', '원산', '기타'],
        required: true
      },
      {
        id: 'q3',
        text: '통일 후 남북한 문화 통합에 있어 가장 중요한 것은 무엇이라고 생각하나요?',
        type: 'multipleChoice',
        options: ['언어 차이 극복', '교육 제도 통합', '문화 예술 교류', '생활 방식 이해', '역사 인식 공유'],
        required: true
      },
      {
        id: 'q4',
        text: '통일이 한반도에 가져올 평화 수준을 1-10 사이로 평가한다면?',
        type: 'scale',
        required: true
      }
    ],
    creationPassword: '$2a$10$8FPV0FMkOUYGbcN9QnLUvuQi3ZbvZ7XmTQCjY6QPEJABsKXAAPXwq', // "admin123"
    isActive: true,
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-01').toISOString()
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

/**
 * 설문 데이터 유효성 검사 - 필수 필드 확인
 * @param {Object} surveyData - 설문 데이터
 * @returns {boolean} - 유효성 검사 결과
 */
function validateSurveyData(surveyData) {
  if (!surveyData) return false;
  
  // 필수 필드: 제목, 설명, 질문, 비밀번호
  const hasTitle = surveyData.title && typeof surveyData.title === 'string' && surveyData.title.trim().length > 0;
  const hasDescription = surveyData.description && typeof surveyData.description === 'string' && surveyData.description.trim().length > 0;
  const hasQuestions = surveyData.questions && Array.isArray(surveyData.questions) && surveyData.questions.length > 0;
  const hasPassword = surveyData.creationPassword && typeof surveyData.creationPassword === 'string' && surveyData.creationPassword.trim().length > 0;
  
  const isValid = hasTitle && hasDescription && hasQuestions && hasPassword;
  
  if (!isValid) {
    console.log('[MongoDB] 설문 데이터 유효성 검사 실패:', {
      hasTitle,
      hasDescription,
      hasQuestions,
      hasPassword,
      fields: Object.keys(surveyData)
    });
  }
  
  // 질문 데이터 검증
  if (hasQuestions) {
    let questionsValid = true;
    
    for (const question of surveyData.questions) {
      const hasId = question.id && typeof question.id === 'string';
      const hasText = question.text && typeof question.text === 'string' && question.text.trim().length > 0;
      const hasType = question.type && ['text', 'multipleChoice', 'scale'].includes(question.type);
      
      // multipleChoice 타입인 경우 options 필수
      const optionsValid = question.type !== 'multipleChoice' || (
        question.options && 
        Array.isArray(question.options) && 
        question.options.length > 0
      );
      
      const questionValid = hasId && hasText && hasType && optionsValid;
      
      if (!questionValid) {
        console.log('[MongoDB] 질문 데이터 유효성 검사 실패:', {
          questionId: question.id,
          hasId,
          hasText,
          hasType,
          optionsValid
        });
        
        questionsValid = false;
        break;
      }
    }
    
    return isValid && questionsValid;
  }
  
  return isValid;
}

// 모듈 내보내기
module.exports = {
  connectToDatabase,
  connectMongoose,
  sampleCountries,
  sampleLetters,
  sampleSurveys,
  validateLetterData,
  validateSurveyData
};