// /api/letters 엔드포인트 - 편지 목록 조회 및 편지 추가
const { getLetters, addLetter } = require('../_lib/google-sheets');

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // GET 요청 처리 (편지 목록 조회)
  if (req.method === 'GET') {
    const countryId = req.query.countryId;
    const result = await getLetters(countryId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  }
  
  // POST 요청 처리 (새 편지 추가)
  if (req.method === 'POST') {
    try {
      const letterData = req.body;
      
      // 필수 필드 검증
      if (!letterData.name || !letterData.email || !letterData.letterContent || !letterData.countryId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      const result = await addLetter(letterData);
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error processing request'
      });
    }
  }
  
  // 지원하지 않는 HTTP 메소드
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed`
  });
}