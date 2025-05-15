/**
 * 디버그 API 엔드포인트
 * 시스템 상태 및 환경 변수 정보를 제공합니다.
 */

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[debug] API 호출:', req.method, req.url);
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 안전한 디버깅 정보만 제공
  const debugInfo = {
    environment: process.env.NODE_ENV || 'development',
    apiBaseUrl: '/api',
    serverTime: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    hostname: process.env.VERCEL_URL || 'localhost',
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    apis: {
      getSurvey: '/api/getSurvey/:id',
      submitSurveyResponse: '/api/submitSurveyResponse',
      getLetters: '/api/get-letters',
      submitLetter: '/api/submit-letter',
      health: '/api/health',
      debug: '/api/debug'
    }
  };
  
  return res.status(200).json({
    success: true,
    data: debugInfo
  });
}; 