// 가장 단순화된 API 테스트 엔드포인트
// 모든 메서드와 요청에 대해 동일한 응답 반환

module.exports = (req, res) => {
  // 모든 CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 모든 요청에 성공 응답
  const responseData = {
    success: true,
    method: req.method,
    path: req.url,
    query: req.query,
    timestamp: new Date().toISOString(),
    message: '테스트 API가 정상 작동합니다',
    // 편지 요청에 대비한 더미 데이터
    data: {
      id: '123456',
      translatedContent: '번역된 내용',
      originalContent: '원본 내용'
    }
  };
  
  // 요청 로깅
  console.log('API 요청 받음:', {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers['origin']
    }
  });
  
  // 모든 요청에 200 OK 응답
  return res.status(200).json(responseData);
};