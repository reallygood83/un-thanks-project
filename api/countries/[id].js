// 특정 ID의 참전국 정보 조회 API
const { PARTICIPATING_COUNTRIES } = require('../data/participatingCountries');

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

// 특정 ID의 참전국 정보 조회 API 핸들러
module.exports = async function handler(req, res) {
  // CORS 사전 요청 처리
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // ID 파라미터 추출
  const { id } = req.query;
  
  // GET 메서드만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      message: '지원하지 않는 메서드입니다',
      success: false 
    });
  }

  try {
    // ID로 참전국 찾기
    const country = PARTICIPATING_COUNTRIES.find(c => c.id === id);
    
    // 참전국이 없는 경우
    if (!country) {
      return res.status(404).json({
        message: '참전국을 찾을 수 없습니다',
        success: false
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '참전국 정보 조회 성공',
      data: country
    });
    
  } catch (error) {
    console.error(`ID ${id}의 참전국 정보 조회 오류:`, error);
    return res.status(500).json({
      message: '서버 오류가 발생했습니다',
      success: false
    });
  }
};