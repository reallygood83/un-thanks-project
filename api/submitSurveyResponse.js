/**
 * 설문 응답 제출 API 엔드포인트
 * 사용자가 작성한 설문 응답을 저장합니다.
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
  console.log('[submitSurveyResponse] API 호출:', req.method, req.url);
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    // 요청 데이터 파싱
    const requestData = req.body;
    console.log('[submitSurveyResponse] 원본 요청 데이터:', JSON.stringify(requestData));
    
    // 데이터 형식 확인
    let surveyId, responses;
    
    // 프론트엔드에서 전송하는 다양한 형식 처리
    if (requestData.surveyId && requestData.responses) {
      // 기존 형식: { surveyId, responses }
      surveyId = requestData.surveyId;
      responses = requestData.responses;
    } else if (requestData.surveyId && requestData.answers) {
      // 다른 형식: { surveyId, answers: [{questionId, value},...] }
      surveyId = requestData.surveyId;
      responses = {};
      
      // answers 배열을 responses 객체로 변환
      if (Array.isArray(requestData.answers)) {
        requestData.answers.forEach(answer => {
          if (answer.questionId) {
            responses[answer.questionId] = answer.value;
          }
        });
      }
    } else if (requestData.respondentInfo && requestData.answers) {
      // SurveyDetailPage.tsx에서 사용하는 형식
      surveyId = req.url.split('/').pop().split('?')[0];
      
      // 응답 데이터 구성
      responses = {
        respondentInfo: requestData.respondentInfo
      };
      
      // answers 배열을 응답 객체로 변환
      if (Array.isArray(requestData.answers)) {
        requestData.answers.forEach(answer => {
          if (answer.questionId) {
            responses[answer.questionId] = answer.value;
          }
        });
      }
    } else {
      // ID를 URL에서 추출 시도
      const urlPath = req.url.split('?')[0];
      if (urlPath.includes('/submitSurveyResponse/')) {
        surveyId = urlPath.split('/').pop();
        responses = requestData;
      } else {
        surveyId = null;
        responses = requestData;
      }
    }
    
    console.log(`[submitSurveyResponse] 처리된 설문 ID: ${surveyId}`);
    console.log(`[submitSurveyResponse] 처리된 응답 데이터:`, JSON.stringify(responses));
    
    if (!surveyId) {
      return res.status(400).json({
        success: false,
        error: '설문 ID가 필요합니다.'
      });
    }
    
    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({
        success: false,
        error: '올바른 응답 데이터가 필요합니다.'
      });
    }
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      console.log('[submitSurveyResponse] MongoDB 연결 시도');
      client = await MongoClient.connect(MONGODB_URI);
      console.log('[submitSurveyResponse] MongoDB 연결 성공');
      
      const db = client.db(DB_NAME);
      const surveysCollection = db.collection('surveys');
      const responsesCollection = db.collection('survey_responses');
      
      // 설문이 존재하는지 확인
      let survey;
      
      try {
        // ObjectId로 조회 시도
        survey = await surveysCollection.findOne({ _id: new ObjectId(surveyId) });
      } catch (e) {
        // 문자열 ID로 조회 시도
        survey = await surveysCollection.findOne({ _id: surveyId });
      }
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          error: '해당 설문을 찾을 수 없습니다.'
        });
      }
      
      // 설문 응답 저장
      const responseData = {
        surveyId: survey._id,
        responses: responses,
        createdAt: new Date()
      };
      
      const result = await responsesCollection.insertOne(responseData);
      
      console.log(`[submitSurveyResponse] 응답 저장 성공: ${result.insertedId}`);
      
      return res.status(200).json({
        success: true,
        data: {
          responseId: result.insertedId,
          message: '설문 응답이 성공적으로 저장되었습니다.'
        }
      });
      
    } finally {
      if (client) {
        await client.close();
        console.log('[submitSurveyResponse] MongoDB 연결 종료');
      }
    }
    
  } catch (error) {
    console.error('[submitSurveyResponse] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 