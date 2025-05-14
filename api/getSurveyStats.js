// /api/getSurveyStats 엔드포인트 - 설문 통계 조회
const { getSurveyStatsFromMongo } = require('./mongo-direct-survey');

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

  console.log("[getSurveyStats API] 호출됨", { 
    method: req.method,
    query: req.query,
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

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      error: '설문 ID가 필요합니다'
    });
  }

  try {
    console.log("[getSurveyStats API] 통계 조회 시작:", id);
    
    const stats = await getSurveyStatsFromMongo(id);
    
    console.log("[getSurveyStats API] 통계 조회 완료");

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[getSurveyStats API] 에러:', error);
    
    if (error.message === '설문을 찾을 수 없습니다') {
      return res.status(404).json({
        success: false,
        error: '설문을 찾을 수 없습니다'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};