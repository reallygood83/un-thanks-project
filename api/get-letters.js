const { MongoClient } = require('mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[get-letters] API 호출:', req.method, req.url);
  
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
  
  try {
    const { type, countryId } = req.query;
    const path = req.url.split('?')[0];
    
    console.log('[get-letters] 경로:', path);
    console.log('[get-letters] 쿼리:', req.query);
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      console.log('[get-letters] MongoDB 연결 시도:', MONGODB_URI ? '설정됨' : '설정되지 않음');
      client = await MongoClient.connect(MONGODB_URI);
      console.log('[get-letters] MongoDB 연결 성공');
      const db = client.db(DB_NAME);
      
      // 특정 ID로 설문 조회 - /api/getSurvey/[id] 경로 처리
      if (path.startsWith('/api/getSurvey/') || path.includes('getSurvey/')) {
        // ID 추출 (URL 경로에서)
        let surveyId = '';
        if (path.startsWith('/api/getSurvey/')) {
          surveyId = path.split('/api/getSurvey/')[1];
        } else if (path.includes('getSurvey/')) {
          surveyId = path.split('getSurvey/')[1];
        }
        
        console.log(`[get-letters] 특정 설문 조회: ID ${surveyId}`);
        
        const collection = db.collection('surveys');
        const survey = await collection.findOne({ _id: surveyId });
        
        console.log(`[get-letters] 설문 조회 결과:`, survey ? '찾음' : '없음');
        
        if (!survey) {
          return res.status(404).json({
            success: false,
            error: '설문을 찾을 수 없습니다.'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: survey
        });
      }
      
      // 설문 목록 요청
      if (type === 'surveys') {
        console.log('[get-letters] 설문 목록 요청');
        const collection = db.collection('surveys');
        const surveys = await collection.find({ isActive: true }).toArray();
        
        console.log(`[get-letters] 설문 ${surveys.length}개 찾음`);
        
        return res.status(200).json({
          success: true,
          data: surveys
        });
      }
      
      // 편지 목록 요청
      console.log('[get-letters] 편지 목록 요청');
      const collection = db.collection('letters');
      const query = countryId ? { countryId } : {};
      const letters = await collection.find(query).sort({ createdAt: -1 }).toArray();
      
      console.log(`[get-letters] 편지 ${letters.length}개 찾음`);
      
      return res.status(200).json({
        success: true,
        data: letters
      });
      
    } finally {
      if (client) {
        await client.close();
        console.log('[get-letters] MongoDB 연결 종료');
      }
    }
    
  } catch (error) {
    console.error('[get-letters] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};