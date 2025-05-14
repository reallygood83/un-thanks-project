// 디버그 API - 서버 상태 확인 및 클라이언트 연결 테스트
const { connectToDatabase } = require('./_lib/mongodb');

/**
 * 디버그 API 핸들러
 */
module.exports = async (req, res) => {
  console.log(`[디버그 API] ${req.method} ${req.url}`);
  
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 요청 정보 수집
    const requestInfo = {
      method: req.method,
      url: req.url,
      path: req.url.replace(/\?.*$/, ''),
      query: req.query,
      headers: req.headers,
      timestamp: new Date().toISOString()
    };
    
    // 환경 정보 수집
    const environmentInfo = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      MONGODB_URI: process.env.MONGODB_URI ? '[SECURED]' : 'NOT_SET',
      MONGODB_DB: process.env.MONGODB_DB || 'unthanks-db',
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION
    };
    
    // MongoDB 연결 테스트
    let dbInfo = {};
    
    try {
      const { db } = await connectToDatabase();
      
      // 컬렉션 정보
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      // 설문 컬렉션 있으면 설문 개수 확인
      let surveysCount = 0;
      if (collectionNames.includes('surveys')) {
        surveysCount = await db.collection('surveys').countDocuments();
      }
      
      // 응답 컬렉션 있으면 응답 개수 확인
      let responsesCount = 0;
      if (collectionNames.includes('surveyResponses')) {
        responsesCount = await db.collection('surveyResponses').countDocuments();
      }
      
      dbInfo = {
        connected: true,
        collections: collectionNames,
        stats: {
          surveys: surveysCount,
          responses: responsesCount
        }
      };
    } catch (dbError) {
      dbInfo = {
        connected: false,
        error: dbError.message
      };
    }
    
    // 서버 상태 반환
    return res.status(200).json({
      success: true,
      message: '디버그 API 정상 작동 중',
      request: requestInfo,
      environment: environmentInfo,
      database: dbInfo
    });
  } catch (error) {
    console.error('[디버그 API] 오류:', error);
    
    // 클라이언트에게 오류 응답
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};