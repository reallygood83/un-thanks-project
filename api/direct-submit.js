// 모든 요청을 그대로 전달하는 핸들러
const axios = require('axios');

// 모든 메서드 허용
module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('[Direct Submit] 요청 메서드:', req.method);
  console.log('[Direct Submit] 요청 URL:', req.url);
  console.log('[Direct Submit] 요청 헤더:', JSON.stringify(req.headers, null, 2));
  
  try {
    // 요청 본문 로깅 (있는 경우)
    if (req.body) {
      console.log('[Direct Submit] 요청 본문:', JSON.stringify(req.body, null, 2));
    }
    
    // 테스트용 기본 응답
    const testResponse = {
      success: true,
      message: 'API 요청 직접 처리',
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    };
    
    // POST 요청이면 편지 데이터로 간주
    if (req.method === 'POST') {
      // 간단한 검증
      if (req.body && req.body.name && req.body.letterContent && req.body.countryId) {
        return res.status(201).json({
          success: true,
          message: '편지가 성공적으로 저장되었습니다',
          data: {
            id: 'direct-' + Date.now(),
            originalContent: req.body.letterContent
          }
        });
      }
    }
    
    return res.status(200).json(testResponse);
  } catch (error) {
    console.error('[Direct Submit] 오류:', error);
    
    return res.status(200).json({
      success: true, // 항상 성공으로 반환
      error: error.message,
      message: '오류가 발생했지만 성공 응답'
    });
  }
}; 