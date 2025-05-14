// /api/getSurveys 엔드포인트 - 설문 목록 조회
const { getSurveysFromMongo } = require('./mongo-direct-survey');

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

  console.log("[getSurveys API] 호출됨", { 
    method: req.method,
    headers: req.headers
  });

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
    console.log("[getSurveys API] 설문 목록 조회 시작");
    
    const result = await getSurveysFromMongo();
    
    console.log("[getSurveys API] 설문 목록 조회 완료:", result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[getSurveys API] 에러:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};