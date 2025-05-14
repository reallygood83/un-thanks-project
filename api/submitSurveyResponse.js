// /api/submitSurveyResponse 엔드포인트 - 설문 응답 제출
const { submitResponseToMongo } = require('./mongo-direct-survey');

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
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  console.log("[submitSurveyResponse API] 호출됨", { 
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }

  const { surveyId, responses } = req.body;
  
  if (!surveyId || !responses) {
    return res.status(400).json({
      success: false,
      error: '설문 ID와 응답이 필요합니다'
    });
  }

  try {
    console.log("[submitSurveyResponse API] 응답 제출 시작:", { surveyId });
    
    const result = await submitResponseToMongo(surveyId, responses);
    
    console.log("[submitSurveyResponse API] 응답 제출 완료");

    return res.status(200).json({
      success: true,
      message: '응답이 성공적으로 제출되었습니다',
      data: result
    });
  } catch (error) {
    console.error('[submitSurveyResponse API] 에러:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};