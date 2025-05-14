const { submitResponseToMongo } = require('./mongo-direct-survey');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8'
};

function setCorsHeaders(res) {
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
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