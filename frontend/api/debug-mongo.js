// MongoDB 디버깅 엔드포인트
const { MongoClient } = require('mongodb');

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
    // 모듈 로딩 확인
    const modules = {
      mongodb: typeof MongoClient !== 'undefined' ? 'loaded' : 'not loaded'
    };

    // 환경 변수 상태 확인
    const envInfo = {
      MONGODB_URI: process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : 'undefined',
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'undefined',
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      VERCEL_ENV: process.env.VERCEL_ENV || 'undefined',
      VERCEL_REGION: process.env.VERCEL_REGION || 'undefined'
    };

    console.log('MongoDB 디버깅 - 환경 변수 정보:', envInfo);

    // MongoDB 연결 시도
    let connectionResult = { success: false, error: null };
    let client = null;

    try {
      // MongoDB URI 가져오기
      const MONGODB_URI = process.env.MONGODB_URI;
      const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다');
      }

      // MongoDB 클라이언트 생성
      client = await MongoClient.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      // 데이터베이스 액세스
      const db = client.db(DB_NAME);
      
      // 간단한 ping 명령 실행
      await db.command({ ping: 1 });
      
      // 컬렉션 목록 가져오기
      const collections = await db.listCollections().toArray();
      
      connectionResult = { 
        success: true, 
        dbName: db.databaseName,
        collections: collections.map(c => c.name)
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

    // 모듈 탐지
    const packagePath = require.resolve('mongodb');

    return res.status(200).json({
      success: true,
      message: 'MongoDB 연결 디버깅 정보',
      modules,
      modulePath: packagePath,
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