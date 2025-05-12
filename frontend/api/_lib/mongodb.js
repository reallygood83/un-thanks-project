// MongoDB 연결 및 편지 데이터 관리
const { MongoClient, ObjectId } = require('mongodb');

// 환경 변수에서 MongoDB URI 가져오기
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/un-thanks-project';
const MONGODB_DB = process.env.MONGODB_DB || 'un-thanks-project';
const LETTERS_COLLECTION = 'letters';

// 연결 객체 캐싱 (서버리스 함수 재사용)
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // 이미 연결이 있으면 재사용
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // 로깅
  console.log('MongoDB에 연결 중...', MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:***@'));

  // MongoDB 연결 옵션
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    // 새 연결 생성
    const client = new MongoClient(MONGODB_URI, options);
    await client.connect();
    const db = client.db(MONGODB_DB);

    // 연결 캐싱
    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB 연결 성공');
    return { client, db };
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    throw error;
  }
}

// 편지 목록 조회 (국가별 필터링 가능)
async function getLetters(countryId) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(LETTERS_COLLECTION);
    
    // 쿼리 필터 설정
    const query = countryId ? { countryId } : {};
    
    // 편지 조회 및 최신순 정렬
    const letters = await collection
      .find(query)
      .sort({ createdAt: -1 })
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
      data: sanitizedLetters
    };
  } catch (error) {
    console.error('편지 목록 조회 오류:', error);
    return {
      success: false,
      error: 'Failed to fetch letters'
    };
  }
}

// 특정 ID의 편지 조회
async function getLetter(id) {
  try {
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
    console.error(`ID ${id}의 편지 조회 오류:`, error);
    return {
      success: false,
      error: 'Failed to fetch letter'
    };
  }
}

// 새 편지 추가
async function addLetter(letterData) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(LETTERS_COLLECTION);
    
    // 가상 번역 (실제로는 번역 API 사용 필요)
    const translatedContent = `[${letterData.countryId} 언어로 번역된 내용: ${letterData.letterContent.substring(0, 30)}...]`;
    
    // 저장할 편지 데이터 구성
    const newLetter = {
      name: letterData.name,
      email: letterData.email,
      school: letterData.school || '',
      grade: letterData.grade || '',
      letterContent: letterData.letterContent,
      translatedContent,
      originalContent: !!letterData.originalContent,
      countryId: letterData.countryId,
      createdAt: new Date()
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
    console.error('편지 추가 오류:', error);
    return {
      success: false,
      error: 'Failed to add letter'
    };
  }
}

module.exports = {
  connectToDatabase,
  getLetters,
  getLetter,
  addLetter
};