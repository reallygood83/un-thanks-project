/**
 * 설문 조회 API 엔드포인트
 * 특정 ID의 설문을 조회합니다.
 */

const { MongoClient } = require('mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[getSurvey] API 호출:', req.method, req.url);
  
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
    // URL에서 ID 추출
    // 경로는 /api/getSurvey/6825d52545a78b576bfbec4f 형식
    const path = req.url.split('?')[0];
    console.log('[getSurvey] 경로:', path);
    
    let surveyId = '';
    
    if (path.startsWith('/api/getSurvey/')) {
      surveyId = path.split('/api/getSurvey/')[1];
    } else if (path.includes('/getSurvey/')) {
      surveyId = path.split('/getSurvey/')[1];
    } else if (path === '/api/getSurvey' || path === '/getSurvey') {
      // URL에서 ID를 추출할 수 없는 경우, 쿼리 파라미터에서 ID 추출 시도
      surveyId = req.query.id;
    }
    
    console.log(`[getSurvey] 추출된 설문 ID: "${surveyId}"`);
    
    if (!surveyId) {
      return res.status(400).json({
        success: false,
        error: '설문 ID가 필요합니다.'
      });
    }
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      console.log('[getSurvey] MongoDB 연결 시도:', MONGODB_URI ? '설정됨' : '설정되지 않음');
      client = await MongoClient.connect(MONGODB_URI);
      console.log('[getSurvey] MongoDB 연결 성공');
      
      const db = client.db(DB_NAME);
      const collection = db.collection('surveys');
      
      // MongoDB에서 설문 조회
      console.log(`[getSurvey] 설문 조회 시도: ${surveyId}`);
      const survey = await collection.findOne({ _id: surveyId });
      
      console.log(`[getSurvey] 설문 조회 결과:`, survey ? '찾음' : '없음');
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          error: '설문을 찾을 수 없습니다.'
        });
      }
      
      // 성공 응답
      return res.status(200).json({
        success: true,
        data: survey
      });
      
    } finally {
      if (client) {
        await client.close();
        console.log('[getSurvey] MongoDB 연결 종료');
      }
    }
    
  } catch (error) {
    console.error('[getSurvey] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 