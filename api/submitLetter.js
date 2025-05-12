// 편지 제출 API 핸들러 - 특정 action 전용
module.exports = (req, res) => {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // POST 요청이 아니면 오류 반환
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
  
  console.log('submitLetter API 호출됨');
  
  // 요청 본문 수집
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      // 요청 본문 파싱
      const data = body ? JSON.parse(body) : {};
      
      console.log('편지 데이터 수신:', {
        hasName: !!data.name,
        hasEmail: !!data.email,
        contentLength: data.letterContent ? data.letterContent.length : 0,
        countryId: data.countryId
      });
      
      // 입력 검증
      if (!data.name || !data.email || !data.letterContent || !data.countryId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      // 프론트엔드에서 기대하는 형식으로 응답
      return res.status(200).json({
        success: true,
        data: {
          id: 'letter-' + Date.now(),
          translatedContent: '[번역된 내용]: ' + data.letterContent.substring(0, 30) + '...',
          originalContent: data.letterContent
        }
      });
    } catch (error) {
      console.error('요청 처리 중 오류:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid request format'
      });
    }
  });
};