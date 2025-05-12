// 레거시 getLetters API 핸들러 - 메인 핸들러로 리디렉션

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
module.exports = async function handler(req, res) {
  try {
    // CORS 헤더 설정
    setCorsHeaders(res);

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log('[getLetters] 레거시 API 호출됨');
    console.log('[getLetters] 메서드:', req.method);

    // GET 요청이 아니면 405 오류 반환
    if (req.method !== 'GET') {
      console.error('[getLetters] 허용되지 않은 메서드:', req.method);
      return res.status(405).json({
        success: false,
        message: '허용되지 않은 HTTP 메서드입니다. GET 요청만 허용됩니다.'
      });
    }

    // URL에서 쿼리 파라미터 추출
    let url;
    try {
      url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
    } catch (urlError) {
      console.error('[getLetters] URL 파싱 오류:', urlError);
      url = { searchParams: { get: () => null } };
    }

    // 국가 ID 추출
    const countryId = url.searchParams.get('countryId') || req.query?.countryId;
    console.log('[getLetters] 국가 ID:', countryId);

    // 액션 파라미터를 첨부하여 메인 핸들러로 리디렉션
    req.url = req.url || '/';
    if (!req.url.includes('action=')) {
      req.url += (req.url.includes('?') ? '&' : '?') + 'action=getLetters';
    }

    // 메인 핸들러로 요청 위임
    const mainHandler = require('./index.js');
    return await mainHandler(req, res);
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
        translatedContent: 'Thank you. I sincerely thank you for helping for the freedom of Korea.',
        countryId: 'usa',
        createdAt: new Date().toISOString()
      },
      {
        id: 'error-2',
        name: '김철수',
        school: '부산중학교',
        grade: '2학년',
        letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
        translatedContent: 'Thank you for your participation. I express deep gratitude for your sacrifice.',
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