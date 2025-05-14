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
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  console.log("[createSurvey API] 호출됨", { 
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

  const { title, description, questions, isActive, creationPassword } = req.body;
  
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
    return res.status(400).json({
      success: false,
      error: '필수 필드가 누락되었습니다'
    });
  }

  try {
    console.log("[createSurvey API] 설문 생성 시작");
    
    const result = await createSurveyInMongo({
      title,
      description,
      questions,
      isActive,
      creationPassword
    });
    
    console.log("[createSurvey API] 설문 생성 완료:", result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[createSurvey API] 에러:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};