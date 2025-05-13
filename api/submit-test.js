// 매우 단순화된 제출 테스트 API
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

  console.log('편지 제출 테스트 API 요청 받음:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    // body는 아직 파싱되지 않았을 수 있음
    bodyType: typeof req.body
  });

  // POST 요청 처리
  if (req.method === 'POST') {
    console.log('POST 요청 처리 중...');
    
    // 요청 본문이 이미 파싱되었는지 확인
    if (req.body && typeof req.body === 'object') {
      console.log('이미 파싱된 본문:', req.body);
      
      return res.status(200).json({
        success: true,
        message: '편지가 성공적으로 제출되었습니다',
        data: {
          id: '123456',
          receivedData: req.body
        }
      });
    }
    
    // 스트림으로부터 요청 본문 직접 읽기
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('읽은 요청 본문:', body);
      
      try {
        const parsedBody = body ? JSON.parse(body) : {};
        
        return res.status(200).json({
          success: true,
          message: '편지가 성공적으로 제출되었습니다',
          data: {
            id: '123456',
            receivedData: parsedBody
          }
        });
      } catch (error) {
        console.error('본문 파싱 오류:', error);
        
        return res.status(400).json({
          success: false,
          message: '요청 본문을 파싱할 수 없습니다',
          error: error.message
        });
      }
    });
    
    return; // 스트림 처리 중에는 응답하지 않음
  }
  
  // GET 요청 처리
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: '편지 제출 테스트 API가 GET 요청에 응답했습니다',
      time: new Date().toISOString()
    });
  }
  
  // 지원하지 않는 메서드
  return res.status(405).json({
    success: false,
    message: '지원하지 않는 HTTP 메서드입니다'
  });
};