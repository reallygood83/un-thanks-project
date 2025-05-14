// /api/getSurveyList 엔드포인트 - 설문 목록 조회 (MongoDB 직접 연결 버전)
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// MongoDB에서 설문 목록 조회
async function getSurveysFromMongo() {
  let client = null;
  
  try {
    console.log('MongoDB 연결 시도...');
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(DB_NAME);
    console.log('DB 연결 성공:', DB_NAME);
    
    const collection = db.collection('surveys');
    const surveys = await collection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`${surveys.length}개의 설문 조회됨`);
    
    return {
      success: true,
      data: surveys.map(survey => {
        const { creationPassword, ...safeData } = survey;
        return safeData;
      }),
      total: surveys.length
    };
  } catch (error) {
    console.error('MongoDB 설문 조회 오류:', error);
    return {
      success: false,
      error: error.message || 'MongoDB 설문 조회 중 오류 발생'
    };
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  }
}

// 설문 목록 조회 API 핸들러
module.exports = async (req, res) => {
  console.log('getSurveyList API 호출 (MongoDB 직접 연결):', req.method, req.url);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    // MongoDB에서 직접 설문 목록 조회
    const result = await getSurveysFromMongo();
    
    console.log('설문 조회 API 결과:', result);
    
    // 결과 반환
    return res.status(200).json(result);
  } catch (error) {
    console.error('설문 조회 API 에러:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '서버 오류가 발생했습니다'
    });
  }
};