// 매우 단순화된 테스트 API
// 외부 의존성 없이 직접 요청 처리

module.exports = (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('직접 테스트 API 요청 받음:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });

  // 간단한 응답
  return res.status(200).json({
    success: true,
    message: '테스트 API가 성공적으로 응답했습니다',
    method: req.method,
    receivedAt: new Date().toISOString()
  });
};