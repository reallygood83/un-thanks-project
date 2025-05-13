// MongoDB 연결 디버깅용 API
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

// 디버깅 API 핸들러
module.exports = async function handler(req, res) {
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // GET 메서드만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      message: '지원하지 않는 메서드입니다',
      success: false 
    });
  }

  try {
    console.log('MongoDB 연결 시도...');
    
    const startTime = Date.now();
    const { client, db } = await connectToDatabase();
    const connectTime = Date.now() - startTime;
    
    // MongoDB 서버 정보 가져오기
    const dbInfo = await db.command({ buildInfo: 1 });
    
    // 컬렉션 목록 확인
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // 편지 컬렉션이 없으면 생성
    if (!collectionNames.includes('letters')) {
      await db.createCollection('letters');
      console.log('letters 컬렉션 생성됨');
    }
    
    // 편지 컬렉션 문서 수 확인
    const letterCount = await db.collection('letters').countDocuments();
    
    return res.status(200).json({
      success: true,
      message: 'MongoDB 연결 성공',
      connectTime: `${connectTime}ms`,
      mongodb: {
        version: dbInfo.version,
        collections: collectionNames,
        letters: {
          count: letterCount
        }
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    return res.status(500).json({
      success: false,
      message: 'MongoDB 연결 실패',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}