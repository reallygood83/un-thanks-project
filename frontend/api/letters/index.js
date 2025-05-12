// /api/letters 엔드포인트 - 편지 목록 조회 및 편지 추가
const { getLetters, addLetter } = require('../_lib/mongodb');

export default async function handler(req, res) {
  console.log('API 요청 받음:', req.method, req.url);
  
  // 환경 변수 확인 로그
  console.log('환경 변수 확인:',
    process.env.MONGODB_URI ? 'MongoDB URI 있음' : 'MongoDB URI 없음',
    process.env.MONGODB_DB ? 'MongoDB DB 있음' : 'MongoDB DB 없음'
  );
  
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
      console.log('POST 요청 처리 시작');
      const letterData = req.body;
      
      // 요청 데이터 로깅 (개인 정보는 마스킹)
      console.log('받은 데이터:', {
        ...letterData,
        email: letterData.email ? '***@***' : undefined, // 이메일 마스킹
        letterContent: letterData.letterContent ? '내용 있음' : '내용 없음'
      });
      
      // 필수 필드 검증
      if (!letterData.name || !letterData.email || !letterData.letterContent || !letterData.countryId) {
        console.log('필수 필드 누락:', {
          hasName: !!letterData.name,
          hasEmail: !!letterData.email,
          hasContent: !!letterData.letterContent,
          hasCountryId: !!letterData.countryId
        });
        
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      console.log('addLetter 함수 호출 시작');
      const result = await addLetter(letterData);
      console.log('addLetter 함수 결과:', result.success ? '성공' : '실패');
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(500).json(result);
      }
    } catch (error) {
      console.error('편지 추가 중 오류 발생:', error);
      // 자세한 오류 정보 제공
      return res.status(500).json({
        success: false,
        error: 'Server error processing request',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  
  // 지원하지 않는 HTTP 메소드
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed`
  });
}