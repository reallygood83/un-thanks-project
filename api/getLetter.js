// /api/getLetter 엔드포인트 - 특정 ID 편지 조회
const { getLetter } = require('./letters');

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

// 특정 ID 편지 조회 API 핸들러
module.exports = async (req, res) => {
  console.log('getLetter API 호출:', req.method, req.url);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드',
      message: 'GET 요청만 허용됩니다'
    });
  }
  
  try {
    // ID 파라미터 추출
    let id;
    
    // URL 경로에서 추출
    if (req.params?.id) {
      id = req.params.id;
    }
    // URL에서 직접 추출
    else if (req.url) {
      try {
        const urlParts = req.url.split('/');
        id = urlParts[urlParts.length - 1];
        // 쿼리 파라미터가 있으면 제거
        if (id.includes('?')) {
          id = id.substring(0, id.indexOf('?'));
        }
      } catch (urlError) {
        console.warn('URL 경로 파싱 오류:', urlError.message);
      }
    }
    
    // 쿼리 파라미터에서 추출 (URL 경로 추출 실패시)
    if (!id && req.query?.id) {
      id = req.query.id;
    }
    
    console.log('편지 ID:', id);
    
    // ID가 없으면 오류 반환
    if (!id) {
      return res.status(400).json({
        success: false,
        error: '편지 ID가 필요합니다',
        message: '조회할 편지의 ID를 제공해야 합니다'
      });
    }
    
    // 편지 조회
    const result = await getLetter(id);
    
    // 결과 처리
    if (result.success) {
      console.log('편지 조회 성공:', id);
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      // 편지가 없는 경우 404
      if (result.error.includes('찾을 수 없습니다')) {
        return res.status(404).json({
          success: false,
          error: result.error,
          message: '요청한 편지를 찾을 수 없습니다'
        });
      }
      
      // 그 외 오류는 500
      return res.status(500).json({
        success: false,
        error: result.error,
        message: '편지 조회 중 오류가 발생했습니다'
      });
    }
  } catch (error) {
    console.error('getLetter 처리 중 오류:', error);
    
    // 오류시 더미 데이터로 응답 (프론트엔드 호환성 유지)
    return res.status(200).json({
      success: true,
      data: {
        id: 'error-id',
        name: '홍길동',
        school: '서울초등학교',
        grade: '5학년',
        letterContent: '한국전쟁에 참전해주셔서 감사합니다. 덕분에 우리나라가 자유와 평화를 지킬 수 있었습니다.',
        countryId: 'usa',
        createdAt: new Date().toISOString()
      },
      error: error.message,
      fallback: true
    });
  }
};