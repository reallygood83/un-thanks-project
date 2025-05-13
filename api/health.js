// 헬스 체크 API - 서버 상태 확인
const { connectToDatabase } = require('./_lib/mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
}

// 상태 체크 API 핸들러
module.exports = async function handler(req, res) {
  try {
    // CORS 헤더 설정
    setCorsHeaders(res);

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log('[health] API 호출됨');
    console.log('[health] 메서드:', req.method);
    console.log('[health] 호스트:', req.headers.host);

    // GET 요청이 아니면 405 오류 반환
    if (req.method !== 'GET') {
      console.error('[health] 허용되지 않은 메서드:', req.method);
      return res.status(405).json({
        success: false,
        message: '허용되지 않은 HTTP 메서드입니다. GET 요청만 허용됩니다.'
      });
    }
    
    // MongoDB 연결 테스트
    try {
      const { db } = await connectToDatabase();
      const collections = await db.listCollections().toArray();
      
      return res.status(200).json({
        success: true,
        status: 'ok',
        version: '1.2.0',
        mongodb: 'connected',
        collections: collections.map(c => c.name),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('[health] MongoDB 연결 오류:', dbError);
      
      return res.status(200).json({
        success: true,
        status: 'degraded',
        version: '1.2.0',
        mongodb: 'disconnected',
        error: dbError.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[health] 처리 중 오류:', error);
    return res.status(500).json({
      success: true, // 프론트엔드 호환성을 위해 success: true 유지
      status: 'error',
      message: '서버 내부 오류가 발생했습니다',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};