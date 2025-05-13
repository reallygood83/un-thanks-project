// 편지 통계 API
const { connectToDatabase } = require('../_lib/mongodb');

// CORS 헤더 설정 헬퍼 함수
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// 편지 통계 API 핸들러
module.exports = async function handler(req, res) {
  // CORS 사전 요청 처리
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // GET 메서드만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      message: '지원하지 않는 메서드입니다',
      success: false 
    });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');
    
    // 국가별 통계 집계
    const stats = await collection.aggregate([
      { $group: { _id: '$countryId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    return res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('편지 통계 조회 오류:', error);
    return res.status(500).json({
      message: '서버 오류가 발생했습니다: ' + error.message,
      success: false
    });
  }
};