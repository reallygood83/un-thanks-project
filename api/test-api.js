// 간단한 테스트 API - 모든 HTTP 메서드 허용
module.exports = (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 요청 정보 로깅
  console.log('[TEST-API] 요청 메서드:', req.method);
  console.log('[TEST-API] 요청 URL:', req.url);
  console.log('[TEST-API] 요청 헤더:', JSON.stringify(req.headers, null, 2));
  
  try {
    // 요청 본문 접근 시도
    const body = req.body || {};
    
    // 모든 요청에 성공 응답
    return res.status(200).json({
      success: true,
      message: '테스트 API 성공',
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: body,
      query: req.query || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[TEST-API] 오류:', error);
    return res.status(200).json({
      success: true,
      error: error.message,
      message: '오류가 발생했지만 성공 응답 반환'
    });
  }
}; 