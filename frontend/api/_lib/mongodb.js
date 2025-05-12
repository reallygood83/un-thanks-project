// MongoDB 연결 및 편지 데이터 관리 모듈
const { MongoClient, ObjectId } = require('mongodb');

// 환경 변수에서 MongoDB URI 가져오기 (필수)
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'un-thanks-project';
const LETTERS_COLLECTION = 'letters';

// 초기 연결 상태 확인
if (!MONGODB_URI) {
  console.error('MONGODB_URI 환경 변수가 설정되지 않았습니다!');
  // 서버리스 함수에서는 초기화 시점에 에러를 던지지 않고, 요청 처리 시 에러를 반환
}

// 연결 객체 캐싱 (서버리스 함수 재사용)
let cachedClient = null;
let cachedDb = null;

// 연결 시도 카운터 및 최대 재시도 횟수
let connectionAttempts = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * MongoDB 데이터베이스 연결
 * @returns {Promise<{client: MongoClient, db: Db}>}
 */
async function connectToDatabase() {
  // 이미 연결이 있으면 재사용
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // URI가 설정되지 않은 경우 오류 발생
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다');
  }

  // 로깅 (보안을 위해 URI에서 인증 정보 마스킹)
  console.log('MongoDB에 연결 중...');

  // MongoDB 연결 옵션 (보안 및 성능 최적화)
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    w: 'majority',
  };

  try {
    connectionAttempts++;
    // 새 연결 생성
    const client = new MongoClient(MONGODB_URI, options);
    await client.connect();
    const db = client.db(MONGODB_DB);

    // 연결 성공 시 카운터 초기화
    connectionAttempts = 0;

    // 연결 캐싱
    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB 연결 성공');
    return { client, db };
  } catch (error) {
    console.error(`MongoDB 연결 오류 (시도 ${connectionAttempts}/${MAX_RETRIES}):`, error.message);
    
    // 최대 재시도 횟수 미만이면 재시도
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`${RETRY_DELAY_MS}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectToDatabase();
    }
    
    // 연결 실패 시 캐시 초기화
    cachedClient = null;
    cachedDb = null;
    connectionAttempts = 0;
    
    throw error;
  }
}

/**
 * 입력 데이터 검증
 * @param {Object} data - 검증할 데이터 객체
 * @param {Array<string>} requiredFields - 필수 필드 목록
 * @returns {boolean} 검증 결과
 */
function validateData(data, requiredFields) {
  if (!data || typeof data !== 'object') return false;
  
  return requiredFields.every(field => {
    return data[field] !== undefined && data[field] !== null && data[field] !== '';
  });
}

/**
 * 편지 목록 조회 (국가별 필터링 가능)
 * @param {string} countryId - 국가 ID (선택적)
 * @param {number} page - 페이지 번호 (선택적, 기본값 1)
 * @param {number} limit - 페이지당 아이템 수 (선택적, 기본값 20)
 * @returns {Promise<{success: boolean, data: Array, total?: number, page?: number, pages?: number}>}
 */
async function getLetters(countryId, page = 1, limit = 20) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(LETTERS_COLLECTION);
    
    // 쿼리 필터 설정
    const query = countryId ? { countryId } : {};
    
    // 페이지네이션 설정
    const skip = (page - 1) * limit;
    
    // 전체 문서 수 계산
    const totalCount = await collection.countDocuments(query);
    
    // 편지 조회 및 최신순 정렬
    const letters = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 개인 정보 제외하고 반환
    const sanitizedLetters = letters.map(letter => ({
      id: letter._id,
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      translatedContent: letter.translatedContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt
    }));
    
    return {
      success: true,
      data: sanitizedLetters,
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    console.error('편지 목록 조회 오류:', error.message);
    return {
      success: false,
      error: '편지 목록을 가져오지 못했습니다'
    };
  }
}

/**
 * 특정 ID의 편지 조회
 * @param {string} id - 편지 ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function getLetter(id) {
  try {
    // ObjectId 유효성 검사
    if (!id || !ObjectId.isValid(id)) {
      return {
        success: false,
        error: '유효하지 않은 편지 ID입니다'
      };
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection(LETTERS_COLLECTION);
    
    // ID로 편지 조회
    const letter = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!letter) {
      return {
        success: false,
        error: 'Letter not found'
      };
    }
    
    // 개인 정보 제외하고 반환
    const sanitizedLetter = {
      id: letter._id,
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      translatedContent: letter.translatedContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt
    };
    
    return {
      success: true,
      data: sanitizedLetter
    };
  } catch (error) {
    console.error(`ID ${id}의 편지 조회 오류:`, error.message);
    return {
      success: false,
      error: '편지를 가져오지 못했습니다'
    };
  }
}

/**
 * 새 편지 추가
 * @param {Object} letterData - 편지 데이터
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function addLetter(letterData) {
  try {
    // 필수 필드 검증
    const requiredFields = ['name', 'email', 'letterContent', 'countryId'];
    if (!validateData(letterData, requiredFields)) {
      return {
        success: false,
        error: '필수 항목이 누락되었습니다'
      };
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection(LETTERS_COLLECTION);
    
    // 입력 데이터 정제 및 보안 처리
    const sanitizedData = {
      name: String(letterData.name).trim().substring(0, 100),
      email: String(letterData.email).trim().toLowerCase().substring(0, 100),
      school: letterData.school ? String(letterData.school).trim().substring(0, 100) : '',
      grade: letterData.grade ? String(letterData.grade).trim().substring(0, 50) : '',
      letterContent: String(letterData.letterContent).trim().substring(0, 5000),
      countryId: String(letterData.countryId).trim()
    };
    
    // 가상 번역 (실제로는 번역 API 사용 필요)
    const translatedContent = `[${sanitizedData.countryId} 언어로 번역된 내용: ${sanitizedData.letterContent.substring(0, 30)}...]`;
    
    // 저장할 편지 데이터 구성
    const newLetter = {
      ...sanitizedData,
      translatedContent,
      originalContent: !!letterData.originalContent,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 데이터베이스에 추가
    const result = await collection.insertOne(newLetter);
    
    if (!result.acknowledged) {
      throw new Error('Failed to insert letter');
    }
    
    return {
      success: true,
      data: {
        id: result.insertedId,
        translatedContent,
        originalContent: letterData.letterContent
      }
    };
  } catch (error) {
    console.error('편지 추가 오류:', error.message);
    return {
      success: false,
      error: '편지를 추가하지 못했습니다'
    };
  }
}

// 모듈 내보내기
module.exports = {
  connectToDatabase,
  getLetters,
  getLetter,
  addLetter,
  validateData
};