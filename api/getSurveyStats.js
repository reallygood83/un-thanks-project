const { getSurveyStatsFromMongo } = require('./mongo-direct-survey');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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