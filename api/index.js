// API 진입점 - 개별 API 핸들러로 라우팅
const submitLetter = require('./submitLetter');
const getLetters = require('./getLetters');
const health = require('./health');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
}

// API 핸들러 함수
module.exports = async (req, res) => {
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 요청 경로 확인 (로깅용)
  console.log(`[API Index] 요청 경로: ${req.url}`);
  console.log(`[API Index] 메서드: ${req.method}`);
  
  try {
    // URL 파싱
    let url;
    try {
      url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
      console.log('[API Index] 파싱된 URL:', url.toString());
      console.log('[API Index] 경로명:', url.pathname);
    } catch (error) {
      console.error('[API Index] URL 파싱 오류:', error);
      url = { pathname: req.url || '/' };
    }

    // 경로 기반 라우팅
    const path = url.pathname || req.url || '/';
    
    // /api/submitLetter 경로 처리
    if (path.endsWith('/submitLetter')) {
      console.log('[API Index] submitLetter 핸들러로 위임');
      return submitLetter(req, res);
    }

    // /api/getLetters 경로 처리
    if (path.endsWith('/getLetters')) {
      console.log('[API Index] getLetters 핸들러로 위임');
      return getLetters(req, res);
    }

    // /api/health 경로 처리
    if (path.endsWith('/health')) {
      console.log('[API Index] health 핸들러로 위임');
      return health(req, res);
    }

    // 기본 상태 페이지 - 다른 API 핸들러에서 처리되지 않은 경우
    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'UN 참전국 감사 편지 API',
      version: '1.2.0',
      endpoints: [
        '/api/submitLetter - 편지 제출 (POST)',
        '/api/getLetters - 편지 목록 조회 (GET)',
        '/api/health - 서버 상태 확인 (GET)'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API Index] 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: error.message
    });
  }
}; 