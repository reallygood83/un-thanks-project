// /api/surveys-list 엔드포인트 - 설문 목록 조회 (letterAPI와 동일한 패턴)
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
}

module.exports = async (req, res) => {
  console.log('surveys-list API 호출:', req.method, req.url);
  
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }

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
    
    // 비밀번호 필드 제거
    const safeSurveys = surveys.map(survey => {
      const { creationPassword, ...safeData } = survey;
      return safeData;
    });

    return res.status(200).json({
      success: true,
      data: safeSurveys
    });
  } catch (error) {
    console.error('MongoDB 조회 오류:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  }
};