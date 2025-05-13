// API - getLetters 편지 목록 조회 처리
const mongodb = require('../_lib/mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
}

// 편지 목록 조회 API 핸들러
module.exports = async (req, res) => {
  try {
    // CORS 헤더 설정
    setCorsHeaders(res);

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log('[getLetters] API 호출됨');
    console.log('[getLetters] 메서드:', req.method);
    console.log('[getLetters] 호스트:', req.headers.host);
    console.log('[getLetters] URL:', req.url);

    // GET 요청이 아니면 405 오류 반환
    if (req.method !== 'GET') {
      console.error('[getLetters] 허용되지 않은 메서드:', req.method);
      return res.status(405).json({
        success: false,
        message: '허용되지 않은 HTTP 메서드입니다. GET 요청만 허용됩니다.'
      });
    }

    // URL에서 쿼리 파라미터 추출
    let countryId, page, limit;

    try {
      // 요청 객체에서 직접 쿼리 파라미터 추출 시도
      if (req.query) {
        countryId = req.query.countryId;
        page = parseInt(req.query.page) || 1;
        limit = parseInt(req.query.limit) || 50;
      } 
      // URL 파싱 시도
      else if (req.url) {
        try {
          const url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
          countryId = url.searchParams.get('countryId');
          page = parseInt(url.searchParams.get('page')) || 1;
          limit = parseInt(url.searchParams.get('limit')) || 50;
        } catch (urlError) {
          console.warn('[getLetters] URL 파싱 실패:', urlError.message);
          // 기본값 설정
          countryId = null;
          page = 1;
          limit = 50;
        }
      } else {
        // 기본값 설정
        countryId = null;
        page = 1;
        limit = 50;
      }
      
      console.log('[getLetters] 쿼리 파라미터:', { countryId, page, limit });
    } catch (paramError) {
      console.error('[getLetters] 쿼리 파라미터 추출 오류:', paramError);
      // 오류 발생 시 기본값 설정
      countryId = null;
      page = 1;
      limit = 50;
    }

    try {
      // MongoDB에서 편지 목록 조회
      const result = await mongodb.getLetters(countryId, page, limit);
      console.log('[getLetters] 조회 성공:', { count: result.data?.length || 0 });
      
      return res.status(200).json(result);
    } catch (dbError) {
      console.error('[getLetters] 데이터 조회 오류:', dbError);
      throw dbError; // 오류 처리 흐름으로 전달
    }
  } catch (error) {
    console.error('[getLetters] 처리 중 오류:', error);

    // 임시 더미 데이터
    const dummyLetters = [
      {
        id: 'error-1',
        name: '홍길동',
        school: '서울초등학교',
        grade: '5학년',
        letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
        countryId: 'usa',
        createdAt: new Date().toISOString()
      },
      {
        id: 'error-2',
        name: '김철수',
        school: '부산중학교',
        grade: '2학년',
        letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
        countryId: 'uk',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    // 프론트엔드에서 처리 가능하도록 항상 성공 응답 반환
    return res.status(200).json({
      success: true, // 프론트엔드 호환성을 위해 success: true 유지
      message: '서버 내부 오류로 임시 데이터를 반환합니다',
      data: dummyLetters,
      error: error.message,
      fallback: true
    });
  }
};