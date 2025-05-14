// /api/surveys 엔드포인트 - 설문 목록 조회 (편지 API와 동일한 패턴)
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

// 설문 목록 조회 API 핸들러
module.exports = async (req, res) => {
  console.log('surveys API 호출 (편지 API와 동일한 패턴):', req.method, req.url);
  
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
      error: '허용되지 않은 메서드',
      message: 'GET 요청만 허용됩니다'
    });
  }

  let client = null;

  try {
    // MongoDB 연결
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(DB_NAME);
    const collection = db.collection('surveys');
    
    // 활성화된 설문만 조회
    const surveys = await collection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`${surveys.length}개의 설문 조회됨`);
    
    // 비밀번호 필드 제거
    const safeSurveys = surveys.map(survey => {
      const { creationPassword, ...safeData } = survey;
      return safeData;
    });
    
    // 응답 전송
    return res.status(200).json({
      success: true,
      data: safeSurveys
    });
  } catch (error) {
    console.error('MongoDB 조회 오류:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'MongoDB 조회 중 오류 발생'
    });
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
    }
  }
};