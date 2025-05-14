// /api/letters-and-surveys 엔드포인트 - 편지와 설문 통합 API
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

// API 핸들러
module.exports = async (req, res) => {
  console.log('letters-and-surveys API 호출:', req.method, req.url);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리
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

  let client = null;

  try {
    // URL 파라미터 추출
    const url = new URL(req.url, `https://${req.headers.host}`);
    const type = url.searchParams.get('type');
    
    console.log('요청 타입:', type);
    
    // MongoDB 연결
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(DB_NAME);
    
    if (type === 'surveys') {
      // 설문 조회
      const collection = db.collection('surveys');
      const surveys = await collection
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`${surveys.length}개의 설문 조회됨`);
      
      return res.status(200).json({
        success: true,
        data: surveys.map(survey => {
          const { creationPassword, ...safeData } = survey;
          return safeData;
        }),
        total: surveys.length
      });
    } else {
      // 편지 조회 (기본값)
      const collection = db.collection('letters');
      const letters = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      
      console.log(`${letters.length}개의 편지 조회됨`);
      
      return res.status(200).json({
        success: true,
        data: letters,
        total: letters.length
      });
    }
  } catch (error) {
    console.error('MongoDB 조회 오류:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};