// /api/createSurvey 엔드포인트 - 설문 생성
const { createSurveyInMongo } = require('./mongo-direct-survey');

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

// 설문 생성 API 핸들러
module.exports = async (req, res) => {
  console.log('createSurvey API 호출:', req.method, req.url);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드',
      message: 'POST 요청만 허용됩니다'
    });
  }
  
  try {
    // 요청 데이터 추출
    const surveyData = req.body;
    
    // 필수 필드 검증
    if (!surveyData.title || !surveyData.description || !surveyData.questions || !surveyData.creationPassword) {
      return res.status(400).json({
        success: false,
        error: '필수 필드 누락',
        message: '제목, 설명, 질문, 비밀번호가 필요합니다'
      });
    }
    
    // MongoDB에 설문 저장
    const result = await createSurveyInMongo(surveyData);
    
    // 결과 처리
    if (result.success) {
      console.log('설문 생성 성공:', result.data._id);
      
      return res.status(201).json({
        success: true,
        data: result.data
      });
    } else {
      console.error('설문 생성 실패:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error,
        message: '설문 생성 중 오류가 발생했습니다'
      });
    }
  } catch (error) {
    console.error('createSurvey 처리 중 오류:', error);
    
    // 오류 응답
    return res.status(500).json({
      success: false,
      error: error.message,
      message: '설문 생성 중 오류가 발생했습니다'
    });
  }
};