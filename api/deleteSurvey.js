/**
 * 설문 삭제 API 엔드포인트
 * 관리자 비밀번호를 통해 설문을 삭제합니다.
 */

const { MongoClient, ObjectId } = require('mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[deleteSurvey] API 호출:', req.method, req.url);
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    // URL에서 설문 ID 추출
    const path = req.url.split('?')[0];
    console.log('[deleteSurvey] 원본 경로:', path);
    
    let surveyId = '';
    
    // URL 경로에서 ID 추출
    if (path.includes('/deleteSurvey/')) {
      const parts = path.split('/');
      surveyId = parts[parts.length - 1];
    }
    
    console.log(`[deleteSurvey] 추출된 설문 ID: "${surveyId}"`);
    
    if (!surveyId) {
      return res.status(400).json({
        success: false,
        error: '설문 ID가 필요합니다.'
      });
    }
    
    // 요청 본문에서 비밀번호 가져오기
    const { password } = req.body || {};
    console.log('[deleteSurvey] 비밀번호 제공 여부:', !!password);
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: '비밀번호가 필요합니다.'
      });
    }
    
    // 하드코딩된 관리자 비밀번호 확인
    const isAdmin = password === '19500625';
    
    if (!isAdmin) {
      console.log('[deleteSurvey] 일반 사용자 - 설문 비밀번호 필요');
      // 일반 사용자인 경우 설문 비밀번호 확인 필요
      // 이 부분은 추후 구현
      return res.status(401).json({
        success: false,
        error: '관리자 비밀번호가 필요합니다.'
      });
    }
    
    console.log('[deleteSurvey] 관리자 확인 완료 - 강제 삭제 권한 부여');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      console.log('[deleteSurvey] MongoDB 연결 시도');
      client = await MongoClient.connect(MONGODB_URI);
      console.log('[deleteSurvey] MongoDB 연결 성공');
      
      const db = client.db(DB_NAME);
      const surveysCollection = db.collection('surveys');
      const responsesCollection = db.collection('survey_responses');
      
      // 설문이 존재하는지 확인
      let survey;
      
      try {
        // ObjectId로 조회 시도
        const objectId = new ObjectId(surveyId);
        survey = await surveysCollection.findOne({ _id: objectId });
      } catch (e) {
        console.log('[deleteSurvey] ObjectId 변환 실패, 문자열 ID로 시도:', e.message);
        // 문자열 ID로 조회 시도
        survey = await surveysCollection.findOne({ _id: surveyId });
      }
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          error: '해당 설문을 찾을 수 없습니다.'
        });
      }
      
      console.log('[deleteSurvey] 설문 찾음:', survey.title);
      
      // 설문 삭제
      let deleteResult;
      
      try {
        // ObjectId로 삭제 시도
        const objectId = new ObjectId(surveyId);
        deleteResult = await surveysCollection.deleteOne({ _id: objectId });
      } catch (e) {
        // 문자열 ID로 삭제 시도
        deleteResult = await surveysCollection.deleteOne({ _id: surveyId });
      }
      
      console.log('[deleteSurvey] 설문 삭제 결과:', deleteResult.deletedCount);
      
      // 관련된 응답들도 삭제
      let responsesDeleteResult;
      
      try {
        // 여러 형식으로 응답 삭제 시도
        const actualSurveyId = survey._id;
        responsesDeleteResult = await responsesCollection.deleteMany({ surveyId: actualSurveyId });
        
        if (responsesDeleteResult.deletedCount === 0) {
          // 다른 형식으로도 시도
          responsesDeleteResult = await responsesCollection.deleteMany({ surveyId: surveyId });
        }
        
        if (responsesDeleteResult.deletedCount === 0) {
          // ObjectId로도 시도
          try {
            const objectId = new ObjectId(surveyId);
            responsesDeleteResult = await responsesCollection.deleteMany({ surveyId: objectId });
          } catch (e) { /* 무시 */ }
        }
      } catch (e) {
        console.log('[deleteSurvey] 응답 삭제 중 오류:', e.message);
      }
      
      console.log('[deleteSurvey] 응답 삭제 결과:', responsesDeleteResult?.deletedCount || 0);
      
      return res.status(200).json({
        success: true,
        message: '설문이 성공적으로 삭제되었습니다.',
        deletedSurvey: deleteResult.deletedCount,
        deletedResponses: responsesDeleteResult?.deletedCount || 0
      });
      
    } finally {
      if (client) {
        await client.close();
        console.log('[deleteSurvey] MongoDB 연결 종료');
      }
    }
    
  } catch (error) {
    console.error('[deleteSurvey] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};