// 참전국 목록 API
import { PARTICIPATING_COUNTRIES } from '../../frontend/src/data/participatingCountries';

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

// 참전국 목록 API 핸들러
export default async function handler(req, res) {
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
    // 참전국 유형 필터링
    const { type } = req.query;
    
    let countries = PARTICIPATING_COUNTRIES;
    
    // 유형별 필터링 (있는 경우)
    if (type) {
      countries = countries.filter(country => country.supportType === type);
    }
    
    return res.status(200).json({
      success: true,
      message: '참전국 목록 조회 성공',
      data: countries
    });
    
  } catch (error) {
    console.error('참전국 목록 조회 오류:', error);
    return res.status(500).json({
      message: '서버 오류가 발생했습니다',
      success: false
    });
  }
}