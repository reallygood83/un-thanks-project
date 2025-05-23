// /api/submitLetter 엔드포인트 - 편지 추가
const mongodb = require('../_lib/mongodb');

module.exports = async function handler(req, res) {
  console.log('API 요청 받음:', req.method, req.url);
  
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
      if (!letterData.name || !letterData.letterContent || !letterData.countryId) {
        console.log('필수 필드 누락:', {
          hasName: !!letterData.name,
          hasContent: !!letterData.letterContent,
          hasCountryId: !!letterData.countryId
        });
        
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // 확인: letterData 객체가 유효한지
      if (typeof letterData !== 'object') {
        console.error('letterData가 유효한 객체가 아닙니다:', letterData);
        return res.status(400).json({
          success: false,
          error: 'Invalid request data'
        });
      }
      
      try {
        console.log('addLetter 함수 호출 시작');
        const result = await mongodb.addLetter(letterData);
        console.log('addLetter 함수 결과:', result.success ? '성공' : '실패');
        
        if (result.success) {
          return res.status(201).json(result);
        } else {
          return res.status(500).json(result);
        }
      } catch (addLetterError) {
        console.error('편지 추가 처리 중 예외 발생:', addLetterError);
        return res.status(500).json({
          success: false,
          error: 'Server error processing request',
          message: addLetterError.message,
        });
      }
    } catch (error) {
      console.error('편지 추가 중 오류 발생:', error);
      // 자세한 오류 정보 제공
      return res.status(500).json({
        success: false,
        error: 'Server error processing request',
        message: error.message,
      });
    }
  }
  
  // 지원하지 않는 HTTP 메소드
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed`
  });
};