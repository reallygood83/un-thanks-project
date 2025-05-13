// MongoDB 디버깅 엔드포인트
const { connectMongo } = require('./mongo-direct');

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 환경 변수 상태 확인
    const envInfo = {
      MONGODB_URI: process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : 'undefined',
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'undefined',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    };

    console.log('MongoDB 디버깅 - 환경 변수 정보:', envInfo);

    // MongoDB 연결 시도
    let connectionResult = { success: false, error: null };
    let client = null;

    try {
      const connection = await connectMongo();
      client = connection.client;
      
      // 간단한 ping 명령 실행
      await connection.db.command({ ping: 1 });
      
      connectionResult = { 
        success: true, 
        dbName: connection.db.databaseName,
        collections: await connection.db.listCollections().toArray()
      };
    } catch (connError) {
      connectionResult = { 
        success: false, 
        error: connError.message,
        stack: connError.stack
      };
    } finally {
      if (client) {
        await client.close();
      }
    }

    // 클라이언트 요청 정보
    const requestInfo = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: 'MongoDB 연결 디버깅 정보',
      environment: envInfo,
      connectionTest: connectionResult,
      request: requestInfo
    });
  } catch (error) {
    console.error('MongoDB 디버깅 중 오류:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};