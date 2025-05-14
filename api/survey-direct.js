// 설문 직접 처리 API
const { createSurveyInMongo, getSurveysFromMongo } = require('./mongo-direct-survey');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

module.exports = async (req, res) => {
  console.log('survey-direct API 호출:', req.method);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // GET 요청 - 설문 목록 조회
    if (req.method === 'GET') {
      const result = await getSurveysFromMongo();
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    }
    
    // POST 요청 - 설문 생성
    if (req.method === 'POST') {
      const { title, description, questions, isActive, creationPassword } = req.body;
      
      // 필수 필드 검증
      if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
        return res.status(400).json({
          success: false,
          error: '필수 필드가 누락되었습니다',
          details: {
            hasTitle: !!title,
            hasQuestions: !!questions,
            isQuestionsArray: Array.isArray(questions),
            questionsLength: questions?.length || 0,
            hasPassword: !!creationPassword
          }
        });
      }
      
      const surveyData = {
        title,
        description,
        questions,
        isActive: isActive !== false,
        creationPassword
      };
      
      const result = await createSurveyInMongo(surveyData);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    }
    
    // 지원하지 않는 메서드
    return res.status(405).json({
      success: false,
      error: '지원하지 않는 메서드입니다'
    });
    
  } catch (error) {
    console.error('survey-direct API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};