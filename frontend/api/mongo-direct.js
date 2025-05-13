// MongoDB 직접 연결 및 처리 모듈
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB 연결 정보
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
const LETTERS_COLLECTION = 'letters';

/**
 * MongoDB에 연결
 * @returns {Promise<{db: any, client: MongoClient}>}
 */
async function connectMongo() {
  try {
    console.log('MongoDB URI 앞부분:', MONGODB_URI ? MONGODB_URI.substring(0, 15) + '...' : 'undefined');
    console.log('DB Name:', DB_NAME);
    
    // MongoDB 클라이언트 생성
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // 데이터베이스 액세스
    const db = client.db(DB_NAME);
    
    console.log('MongoDB 연결 성공!');
    return { client, db };
  } catch (err) {
    console.error('MongoDB 연결 오류:', err);
    throw err;
  }
}

/**
 * 편지 저장
 * @param {Object} letterData - 편지 데이터
 * @returns {Promise<Object>}
 */
async function addLetterToMongo(letterData) {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 컬렉션 참조
    const collection = db.collection(LETTERS_COLLECTION);
    
    // 저장할 문서 생성 (클라이언트 요청 필드 매핑)
    const letter = {
      name: letterData.name || letterData.sender || '',
      school: letterData.school || letterData.affiliation || '',
      grade: letterData.grade || '',
      letterContent: letterData.letterContent || letterData.message || '',  // 필드명 호환성 추가
      countryId: letterData.countryId || letterData.country || '',  // 필드명 호환성 추가
      sender: letterData.sender || letterData.name || '',  // 필드명 호환성 추가
      affiliation: letterData.affiliation || letterData.school || '',  // 필드명 호환성 추가
      createdAt: new Date()
    };
    
    // MongoDB에 저장
    const result = await collection.insertOne(letter);
    
    console.log('MongoDB에 편지 저장 성공:', result.insertedId);
    
    // 응답 데이터 생성
    return {
      success: true,
      data: {
        id: result.insertedId.toString(),
        originalContent: letterData.letterContent || letterData.message || ''
      }
    };
  } catch (error) {
    console.error('MongoDB 편지 저장 오류:', error);
    return {
      success: false,
      error: error.message || 'MongoDB 편지 저장 중 오류 발생'
    };
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  }
}

/**
 * 편지 목록 조회
 * @param {Object} options - 조회 옵션
 * @returns {Promise<Object>}
 */
async function getLettersFromMongo(options = {}) {
  let client = null;
  
  try {
    // 조회 옵션 설정
    const { countryId, page = 1, limit = 20 } = options;
    
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 컬렉션 참조
    const collection = db.collection(LETTERS_COLLECTION);
    
    // 쿼리 필터 설정
    const filter = countryId ? { countryId } : {};
    
    // 총 문서 수 조회
    const total = await collection.countDocuments(filter);
    
    // 페이지네이션 적용하여 문서 조회
    const letters = await collection
      .find(filter)
      .sort({ createdAt: -1 })  // 최신순 정렬
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    console.log(`MongoDB에서 ${letters.length}개 편지 조회됨 (총 ${total}개 중)`);
    
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
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('MongoDB 편지 목록 조회 오류:', error);
    return {
      success: false,
      error: error.message || 'MongoDB 편지 목록 조회 중 오류 발생'
    };
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  }
}

/**
 * 특정 ID 편지 조회
 * @param {string} id - 조회할 편지 ID
 * @returns {Promise<Object>}
 */
async function getLetterFromMongo(id) {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 컬렉션 참조
    const collection = db.collection(LETTERS_COLLECTION);
    
    // ID 형식 확인 및 변환
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      console.error('유효하지 않은 ObjectId 형식:', id);
      return {
        success: false,
        error: '유효하지 않은 ID 형식입니다'
      };
    }
    
    // ID로 문서 조회
    const letter = await collection.findOne({ _id: objectId });
    
    // 편지를 찾지 못한 경우
    if (!letter) {
      console.log(`ID ${id}에 해당하는 편지를 찾을 수 없습니다`);
      return {
        success: false,
        error: '요청한 ID의 편지를 찾을 수 없습니다'
      };
    }
    
    console.log(`ID ${id} 편지 조회 성공`);
    
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
    console.error('MongoDB 편지 조회 오류:', error);
    return {
      success: false,
      error: error.message || 'MongoDB 편지 조회 중 오류 발생'
    };
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  }
}

module.exports = {
  connectMongo,
  addLetterToMongo,
  getLettersFromMongo,
  getLetterFromMongo
};