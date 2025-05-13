// /api/direct-submitLetter 엔드포인트 - MongoDB 직접 연결 버전
const { addLetterToMongo } = require('./mongo-direct');

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
  console.log('direct-submitLetter API 호출:', req.method);
  
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
    const body = req.body;
    
    if (!body) {
      return res.status(400).json({
        success: false,
        error: '요청 본문이 비어있습니다'
      });
    }
    
    // 편지 데이터 추출 (여러 형태 지원)
    console.log('원본 요청 데이터:', JSON.stringify(body).substring(0, 200));
    
    // 필드명 매핑 (호환성)
    const letterData = {
      name: body.name || body.sender || '',
      sender: body.sender || body.name || '',
      school: body.school || body.affiliation || '',
      affiliation: body.affiliation || body.school || '',
      grade: body.grade || '',
      letterContent: body.letterContent || body.message || '',
      message: body.message || body.letterContent || '',
      countryId: body.countryId || body.country || '',
      country: body.country || body.countryId || '',
      createdAt: new Date()
    };
    
    console.log('처리된 편지 데이터:', {
      name: letterData.name,
      school: letterData.school || '(없음)',
      grade: letterData.grade || '(없음)',
      contentLength: letterData.letterContent?.length || 0,
      countryId: letterData.countryId
    });
    
    // 필수 필드 검증
    if (!letterData.name || !letterData.letterContent || !letterData.countryId) {
      return res.status(400).json({
        success: false,
        error: '필수 항목 누락',
        message: '이름, 편지 내용, 국가ID는 필수 항목입니다',
        receivedFields: Object.keys(body)
      });
    }
    
    // MongoDB에 직접 편지 저장
    const result = await addLetterToMongo(letterData);
    
    // 결과 처리
    if (result.success) {
      console.log('편지 MongoDB 저장 성공:', result.data.id);
      return res.status(201).json({
        success: true,
        data: {
          id: result.data.id,
          originalContent: letterData.letterContent
        },
        message: '편지가 성공적으로 MongoDB에 저장되었습니다'
      });
    } else {
      console.error('편지 MongoDB 저장 실패:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error,
        message: '편지 MongoDB 저장 중 오류가 발생했습니다'
      });
    }
  } catch (error) {
    console.error('direct-submitLetter 처리 중 오류:', error);
    
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};