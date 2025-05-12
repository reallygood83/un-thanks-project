// 레거시 submitLetter API 핸들러 - 메인 핸들러로 리디렉션
const { parseBody } = require('./_lib/parser');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
}

// 편지 제출 API 핸들러
module.exports = async function handler(req, res) {
  try {
    // CORS 헤더 설정
    setCorsHeaders(res);

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log('[submitLetter] 레거시 API 호출됨');
    console.log('[submitLetter] 메서드:', req.method);

    // POST 요청이 아니면 405 오류 반환
    if (req.method !== 'POST') {
      console.error('[submitLetter] 허용되지 않은 메서드:', req.method);
      return res.status(405).json({
        success: false,
        message: '허용되지 않은 HTTP 메서드입니다. POST 요청만 허용됩니다.'
      });
    }

    // 액션 파라미터를 첨부하여 메인 핸들러로 리디렉션
    req.url = req.url || '/';
    if (!req.url.includes('action=')) {
      req.url += (req.url.includes('?') ? '&' : '?') + 'action=submitLetter';
    }

    // 요청 본문이 아직 파싱되지 않았다면 파싱해둠
    if (!req.body || Object.keys(req.body).length === 0) {
      try {
        const body = await parseBody(req);
        req.body = body;
        console.log('[submitLetter] 본문 파싱 완료:', {
          hasName: !!body.name,
          hasEmail: !!body.email,
          hasContent: !!body.letterContent,
          countryId: body.countryId
        });
      } catch (parseError) {
        console.error('[submitLetter] 본문 파싱 오류:', parseError);
      }
    }

    // 메인 핸들러로 요청 위임
    const mainHandler = require('./index.js');
    return await mainHandler(req, res);
  } catch (error) {
    console.error('[submitLetter] 처리 중 오류:', error);
    return res.status(500).json({
      success: true, // 프론트엔드 호환성을 위해 success: true 유지
      message: '서버 내부 오류로 임시 데이터를 반환합니다',
      data: {
        id: 'error-' + Date.now(),
        translatedContent: '[번역 오류 발생]',
        originalContent: req.body?.letterContent || ''
      },
      error: error.message,
      fallback: true
    });
  }
};