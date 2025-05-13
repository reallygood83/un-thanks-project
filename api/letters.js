// 편지 API 구현
const { connectToDatabase } = require('./db');
const { ObjectId } = require('mongodb');

// 상수 정의
const COLLECTION_NAME = 'letters';

// 초기 더미 데이터
const INITIAL_LETTERS = [
  {
    name: '홍길동',
    school: '서울초등학교',
    grade: '5학년',
    letterContent: '한국전쟁에 참전해주셔서 감사합니다. 덕분에 우리나라가 자유와 평화를 지킬 수 있었습니다.',
    countryId: 'usa',
    createdAt: new Date()
  },
  {
    name: '김철수',
    school: '부산초등학교',
    grade: '6학년',
    letterContent: '대한민국의 자유를 위해 희생해주신 참전용사분들께 진심으로 감사드립니다.',
    countryId: 'uk',
    createdAt: new Date(Date.now() - 86400000)
  }
];

/**
 * 편지 컬렉션 초기화
 * @returns {Promise<void>}
 */
async function initLettersCollection() {
  try {
    const { db } = await connectToDatabase();
    
    // 컬렉션 존재 여부 확인
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    
    // 컬렉션이 없으면 생성
    if (collections.length === 0) {
      console.log(`컬렉션 생성: ${COLLECTION_NAME}`);
      await db.createCollection(COLLECTION_NAME);
      
      // 초기 데이터 삽입
      const count = await db.collection(COLLECTION_NAME).countDocuments();
      if (count === 0) {
        console.log('초기 샘플 데이터 삽입');
        await db.collection(COLLECTION_NAME).insertMany(INITIAL_LETTERS);
      }
    }
  } catch (error) {
    console.error('컬렉션 초기화 오류:', error);
    throw error;
  }
}

/**
 * 편지 추가
 * @param {Object} letterData - 편지 데이터
 * @returns {Promise<Object>} 삽입된 편지 정보
 */
async function addLetter(letterData) {
  try {
    // 필수 필드 검증
    if (!letterData.name || !letterData.letterContent || !letterData.countryId) {
      throw new Error('필수 항목이 누락되었습니다 (이름, 편지내용, 국가ID)');
    }
    
    const { db } = await connectToDatabase();
    
    // 컬렉션 초기화 확인
    await initLettersCollection();
    
    // 저장할 문서 생성
    const letter = {
      name: letterData.name,
      school: letterData.school || '',
      grade: letterData.grade || '',
      letterContent: letterData.letterContent,
      countryId: letterData.countryId,
      createdAt: new Date()
    };
    
    // 데이터베이스에 저장
    const result = await db.collection(COLLECTION_NAME).insertOne(letter);
    
    // 응답 데이터 생성
    return {
      success: true,
      letter: {
        id: result.insertedId.toString(),
        ...letter,
        createdAt: letter.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('편지 추가 오류:', error);
    return {
      success: false,
      error: error.message || '편지 저장 중 오류가 발생했습니다'
    };
  }
}

/**
 * 편지 목록 조회
 * @param {Object} options - 조회 옵션
 * @param {string} [options.countryId] - 국가 ID 필터
 * @param {number} [options.page=1] - 페이지 번호
 * @param {number} [options.limit=20] - 페이지당 항목 수
 * @returns {Promise<Object>} 편지 목록 정보
 */
async function getLetters({ countryId, page = 1, limit = 20 } = {}) {
  try {
    const { db } = await connectToDatabase();
    
    // 컬렉션 초기화 확인
    await initLettersCollection();
    
    // 필터 조건 생성
    const filter = countryId ? { countryId } : {};
    
    // 총 문서 수 조회
    const total = await db.collection(COLLECTION_NAME).countDocuments(filter);
    
    // 페이지네이션 적용하여 문서 조회
    const letters = await db.collection(COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 }) // 최신순 정렬
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    // 응답 데이터 생성
    return {
      success: true,
      data: letters.map(letter => ({
        id: letter._id.toString(),
        name: letter.name,
        school: letter.school || '',
        grade: letter.grade || '',
        letterContent: letter.letterContent,
        countryId: letter.countryId,
        createdAt: letter.createdAt instanceof Date 
          ? letter.createdAt.toISOString() 
          : letter.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('편지 목록 조회 오류:', error);
    return {
      success: false,
      error: error.message || '편지 목록 조회 중 오류가 발생했습니다'
    };
  }
}

/**
 * 특정 ID의 편지 조회
 * @param {string} id - 편지 ID
 * @returns {Promise<Object>} 편지 정보
 */
async function getLetter(id) {
  try {
    if (!id) {
      throw new Error('편지 ID가 필요합니다');
    }
    
    const { db } = await connectToDatabase();
    
    // 컬렉션 초기화 확인
    await initLettersCollection();
    
    // ID를 MongoDB ObjectId로 변환 시도
    let objectId;
    try {
      if (id.length === 24) {
        objectId = new ObjectId(id);
      }
    } catch (e) {
      // 변환 실패시 문자열 ID로 조회 시도
      objectId = null;
    }
    
    // 필터 설정
    const filter = objectId ? { _id: objectId } : { _id: id };
    
    // 편지 조회
    const letter = await db.collection(COLLECTION_NAME).findOne(filter);
    
    if (!letter) {
      return {
        success: false,
        error: '해당 ID의 편지를 찾을 수 없습니다'
      };
    }
    
    // 응답 데이터 생성
    return {
      success: true,
      data: {
        id: letter._id.toString(),
        name: letter.name,
        school: letter.school || '',
        grade: letter.grade || '',
        letterContent: letter.letterContent,
        countryId: letter.countryId,
        createdAt: letter.createdAt instanceof Date 
          ? letter.createdAt.toISOString() 
          : letter.createdAt
      }
    };
  } catch (error) {
    console.error('편지 조회 오류:', error);
    return {
      success: false,
      error: error.message || '편지 조회 중 오류가 발생했습니다'
    };
  }
}

module.exports = {
  addLetter,
  getLetters,
  getLetter,
  initLettersCollection
};