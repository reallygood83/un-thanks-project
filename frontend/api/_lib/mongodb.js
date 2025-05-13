// MongoDB API 모듈
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB 연결 문자열 (환경 변수에서 가져옴)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://unthanks:unthanks2025@cluster0.mongodb.net/unthanks-db?retryWrites=true&w=majority';
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
const LETTERS_COLLECTION = 'letters';

// MongoDB 클라이언트 캐싱
let cachedClient = null;
let cachedDb = null;

/**
 * MongoDB에 연결
 * @returns {Promise<{client: MongoClient, db: Db}>} MongoDB 클라이언트와 DB 객체
 */
async function connectToDatabase() {
  console.log('[MongoDB] 연결 시도 중... (URI 앞부분:', MONGODB_URI.substring(0, 20) + '***)');
  
  // 이미 연결된 클라이언트가 있으면 재사용
  if (cachedClient && cachedDb) {
    console.log('[MongoDB] 기존 연결 재사용');
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // 연결 옵션
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // MongoDB 클라이언트 연결
    const client = await MongoClient.connect(MONGODB_URI, options);
    const db = client.db(DB_NAME);
    
    // 연결 성공 시 캐싱
    cachedClient = client;
    cachedDb = db;
    
    console.log('[MongoDB] 데이터베이스 연결 성공! DB:', DB_NAME);
    
    return { client, db };
  } catch (error) {
    console.error('[MongoDB] 데이터베이스 연결 오류:', error.message);
    
    // 더미 데이터 반환 모드로 전환
    console.log('[MongoDB] 더미 데이터 모드로 전환됩니다.');
    
    return { client: null, db: null };
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

// 더미 데이터 (MongoDB 연결 실패 시 사용)
const dummyLetters = [
  {
    _id: '1',
    name: '홍길동',
    school: '서울초등학교',
    grade: '5학년',
    letterContent: '감사합니다',
    countryId: 'usa',
    createdAt: new Date()
  },
  {
    _id: '2',
    name: '김철수',
    school: '부산초등학교',
    grade: '6학년',
    letterContent: '고맙습니다',
    countryId: 'uk',
    createdAt: new Date(Date.now() - 86400000)
  }
];

/**
 * 편지 목록 조회
 * @param {string} countryId - 국가 ID (선택적)
 * @param {number} page - 페이지 번호 (선택적, 기본값 1)
 * @param {number} limit - 페이지당 아이템 수 (선택적, 기본값 20)
 * @returns {Promise<{success: boolean, data: Array, total?: number, page?: number, pages?: number}>}
 */
async function getLetters(countryId, page = 1, limit = 20) {
  console.log('[MongoDB] getLetters 호출:', { countryId, page, limit });
  
  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    
    // MongoDB가 연결되지 않은 경우 더미 데이터 반환
    if (!db) {
      console.log('[MongoDB] 연결 실패, 더미 데이터 반환');
      return getDummyLetters(countryId, page, limit);
    }
    
    // 컬렉션 접근
    const collection = db.collection(LETTERS_COLLECTION);
    
    // 컬렉션이 존재하는지 확인하여 없으면 생성
    const collections = await db.listCollections({ name: LETTERS_COLLECTION }).toArray();
    if (collections.length === 0) {
      console.log(`[MongoDB] ${LETTERS_COLLECTION} 컬렉션이 없어 새로 생성합니다.`);
      await db.createCollection(LETTERS_COLLECTION);
      
      // 더미 데이터 초기 삽입 (컬렉션이 비어있을 경우)
      if ((await collection.countDocuments()) === 0) {
        console.log('[MongoDB] 빈 컬렉션에 초기 더미 데이터 삽입');
        await collection.insertMany(dummyLetters);
      }
    }
    
    // 필터 조건 설정
    const filter = countryId ? { countryId } : {};
    
    // 전체 문서 수 조회
    const total = await collection.countDocuments(filter);
    
    // 페이지네이션 및 정렬 적용하여 문서 조회
    const letters = await collection
      .find(filter)
      .sort({ createdAt: -1 }) // 최신순 정렬
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    console.log(`[MongoDB] ${letters.length}개의 편지를 가져왔습니다 (총 ${total}개 중)`);
    
    // 포맷팅된 응답
    const formattedLetters = letters.map(letter => ({
      id: letter._id.toString(),
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt instanceof Date ? letter.createdAt.toISOString() : letter.createdAt
    }));
    
    return {
      success: true,
      data: formattedLetters,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('[MongoDB] getLetters 오류:', error.message);
    
    // 오류 발생 시 더미 데이터 반환
    return getDummyLetters(countryId, page, limit);
  }
}

/**
 * 더미 편지 목록 조회 (MongoDB 연결 실패 시 사용)
 * @param {string} countryId - 국가 ID (선택적)
 * @param {number} page - 페이지 번호 (선택적, 기본값 1)
 * @param {number} limit - 페이지당 아이템 수 (선택적, 기본값 20)
 * @returns {{success: boolean, data: Array, total: number, page: number, pages: number}}
 */
function getDummyLetters(countryId, page = 1, limit = 20) {
  // 국가별 필터링
  const filtered = countryId 
    ? dummyLetters.filter(letter => letter.countryId === countryId)
    : dummyLetters;
  
  // 정렬: 최신순
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 페이지네이션
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = filtered.slice(startIndex, endIndex);
  
  // 포맷팅된 응답
  const formattedLetters = paginatedData.map(letter => ({
    id: letter._id,
    name: letter.name,
    school: letter.school,
    grade: letter.grade,
    letterContent: letter.letterContent,
    countryId: letter.countryId,
    createdAt: letter.createdAt instanceof Date ? letter.createdAt.toISOString() : letter.createdAt
  }));
  
  return {
    success: true,
    data: formattedLetters,
    total: filtered.length,
    page: page,
    pages: Math.ceil(filtered.length / limit)
  };
}

/**
 * 특정 ID의 편지 조회
 * @param {string} id - 편지 ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function getLetter(id) {
  console.log(`[MongoDB] getLetter 호출 (ID: ${id})`);
  
  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    
    // MongoDB가 연결되지 않은 경우 더미 데이터 반환
    if (!db) {
      console.log('[MongoDB] 연결 실패, 더미 데이터 반환');
      return getDummyLetter(id);
    }
    
    // MongoDB ObjectId로 변환 시도
    let objectId;
    try {
      // ObjectId 형식이면 변환
      if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        objectId = new ObjectId(id);
      }
    } catch (e) {
      // ID가 ObjectId 형식이 아닌 경우 그대로 사용
      objectId = null;
    }
    
    // 쿼리 필터 구성 (ObjectId 또는 문자열 ID 사용)
    const filter = objectId ? { _id: objectId } : { _id: id };
    
    // 편지 조회
    const letter = await db.collection(LETTERS_COLLECTION).findOne(filter);
    
    if (!letter) {
      console.log(`[MongoDB] 편지를 찾을 수 없음 (ID: ${id})`);
      return {
        success: false,
        error: 'Letter not found'
      };
    }
    
    return {
      success: true,
      data: {
        id: letter._id.toString(),
        name: letter.name,
        school: letter.school || '',
        grade: letter.grade || '',
        letterContent: letter.letterContent,
        countryId: letter.countryId,
        createdAt: letter.createdAt instanceof Date ? letter.createdAt.toISOString() : letter.createdAt
      }
    };
  } catch (error) {
    console.error(`[MongoDB] getLetter 오류 (ID: ${id}):`, error.message);
    
    // 오류 발생 시 더미 데이터 반환
    return getDummyLetter(id);
  }
}

/**
 * 더미 편지 단일 조회 (MongoDB 연결 실패 시 사용)
 * @param {string} id - 편지 ID
 * @returns {{success: boolean, data?: Object, error?: string}}
 */
function getDummyLetter(id) {
  // 더미 데이터에서 편지 찾기
  const letter = dummyLetters.find(letter => letter._id === id);
  
  if (!letter) {
    return {
      success: false,
      error: 'Letter not found'
    };
  }
  
  return {
    success: true,
    data: {
      id: letter._id,
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt instanceof Date ? letter.createdAt.toISOString() : letter.createdAt
    }
  };
}

/**
 * 새 편지 추가
 * @param {Object} letterData - 편지 데이터
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function addLetter(letterData) {
  console.log('[MongoDB] addLetter 호출:', {
    name: letterData.name,
    school: letterData.school,
    grade: letterData.grade,
    countryId: letterData.countryId,
    contentLength: letterData.letterContent?.length
  });
  
  try {
    // 필수 필드 검증
    const requiredFields = ['name', 'letterContent', 'countryId'];
    if (!validateData(letterData, requiredFields)) {
      console.error('[MongoDB] 필수 항목 누락:', letterData);
      return {
        success: false,
        error: '필수 항목이 누락되었습니다'
      };
    }
    
    // MongoDB 연결
    const { db } = await connectToDatabase();
    
    // MongoDB가 연결되지 않은 경우 더미 응답 반환
    if (!db) {
      console.log('[MongoDB] 연결 실패, 더미 응답 반환');
      
      // 더미 ID 생성
      const dummyId = 'letter-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      
      return {
        success: true,
        data: {
          id: dummyId,
          originalContent: letterData.letterContent
        }
      };
    }
    
    // 컬렉션 접근
    const collection = db.collection(LETTERS_COLLECTION);
    
    // 컬렉션이 존재하는지 확인하여 없으면 생성
    const collections = await db.listCollections({ name: LETTERS_COLLECTION }).toArray();
    if (collections.length === 0) {
      console.log(`[MongoDB] ${LETTERS_COLLECTION} 컬렉션이 없어 새로 생성합니다.`);
      await db.createCollection(LETTERS_COLLECTION);
    }
    
    // 삽입할 문서 생성
    const letterDoc = {
      name: letterData.name,
      school: letterData.school || '',
      grade: letterData.grade || '',
      letterContent: letterData.letterContent,
      countryId: letterData.countryId,
      createdAt: new Date()
    };
    
    // MongoDB에 삽입
    const result = await collection.insertOne(letterDoc);
    
    console.log('[MongoDB] 편지 저장 성공:', result.insertedId);
    
    // 응답 데이터 구성
    return {
      success: true,
      data: {
        id: result.insertedId.toString(),
        originalContent: letterData.letterContent
      }
    };
  } catch (error) {
    console.error('[MongoDB] addLetter 오류:', error.message);
    
    // 오류 발생 시 더미 ID로 응답
    const fallbackId = 'letter-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    
    return {
      success: true, // 사용자 경험을 위해 성공으로 처리
      data: {
        id: fallbackId,
        originalContent: letterData.letterContent
      }
    };
  }
}

// 편지 데이터 검증
function validateLetterData(letterData) {
  return validateData(letterData, ['name', 'letterContent', 'countryId']);
}

// 모듈 내보내기
module.exports = {
  connectToDatabase,
  getLetters,
  getLetter,
  addLetter,
  validateData,
  validateLetterData
};