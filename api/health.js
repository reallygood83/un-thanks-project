// 헬스 체크 API
const { connectToDatabase } = require('./_lib/mongodb');

// CORS 헤더 설정 헬퍼 함수
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// 헬스 체크 API 핸들러
module.exports = async function handler(req, res) {
  // CORS 사전 요청 처리
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // CORS 헤더 설정
  setCorsHeaders(res);

  try {
    // 데이터베이스 연결 테스트
    const { db } = await connectToDatabase();
    
    // 몽고DB 정보 가져오기
    const serverStatus = await db.command({ serverStatus: 1 });
    
    return res.status(200).json({
      status: 'ok',
      message: 'API 서버가 정상 작동 중입니다',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      mongodb: {
        connected: true,
        version: serverStatus.version
      }
    });
    
  } catch (error) {
    console.error('헬스 체크 오류:', error);
    
    // 데이터베이스 연결 실패해도 API는 동작 중이라고 응답
    return res.status(200).json({
      status: 'degraded',
      message: 'API 서버는 작동 중이지만 데이터베이스 연결에 문제가 있습니다',
      error: error.message,
      timestamp: new Date().toISOString(),
      mongodb: {
        connected: false
      }
    });
  }
};