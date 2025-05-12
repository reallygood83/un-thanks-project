// 테스트 API - Vercel 서버리스 함수가 정상적으로 동작하는지 확인용
module.exports = function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 요청 정보 로깅
  console.log('테스트 API 요청:', {
    method: req.method,
    path: req.url,
    query: req.query,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers['origin']
    }
  });

  // 응답 반환
  res.status(200).json({
    status: 'ok',
    message: 'Vercel 서버리스 함수가 정상적으로 동작 중입니다',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      query: req.query
    },
    api_version: '1.0.0'
  });
}