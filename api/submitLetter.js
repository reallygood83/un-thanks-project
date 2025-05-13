// /api/submitLetter 엔드포인트 - 편지 제출 처리
const { addLetter } = require('./letters');

// CORS 헤더 설정
function setCorsHeaders(res) {
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
}

// 편지 제출 API 핸들러
module.exports = async (req, res) => {
  console.log('submitLetter API 호출:', req.method);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드',
      message: 'POST 요청만 허용됩니다'
    });
  }
  
  try {
    // 요청 본문 확인
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: '요청 본문이 비어있습니다'
      });
    }
    
    // 편지 데이터 추출
    const { name, school, grade, letterContent, countryId } = req.body;
    
    console.log('편지 데이터 수신:', { 
      name, 
      school: school || '(없음)', 
      grade: grade || '(없음)', 
      contentLength: letterContent?.length || 0,
      countryId 
    });
    
    // 필수 필드 검증
    if (!name || !letterContent || !countryId) {
      return res.status(400).json({
        success: false,
        error: '필수 항목 누락',
        message: '이름, 편지 내용, 국가ID는 필수 항목입니다'
      });
    }
    
    // 편지 저장
    const result = await addLetter({
      name,
      school,
      grade,
      letterContent,
      countryId
    });
    
    // 결과 처리
    if (result.success) {
      console.log('편지 저장 성공:', result.letter.id);
      return res.status(201).json({
        success: true,
        data: {
          id: result.letter.id,
          originalContent: letterContent
        },
        message: '편지가 성공적으로 저장되었습니다'
      });
    } else {
      console.error('편지 저장 실패:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error,
        message: '편지 저장 중 오류가 발생했습니다'
      });
    }
  } catch (error) {
    console.error('submitLetter 처리 중 오류:', error);
    
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};