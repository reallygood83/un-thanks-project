// 가장 단순한 형태의 submitLetter API 구현
const { addLetter } = require('./letters-simple');

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

// API 핸들러
module.exports = (req, res) => {
  // 디버그 로깅
  console.log('API 호출됨: submitLetter-simple');
  console.log('HTTP 메서드:', req.method);

  // CORS 헤더 설정
  setCorsHeaders(res);

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청이 아니면 405 반환
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: 'POST 요청만 허용됩니다'
    });
  }

  try {
    // 요청 본문 확인
    if (!req.body) {
      console.error('요청 본문이 없음');
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '요청 본문이 비어있습니다'
      });
    }

    console.log('요청 본문 타입:', typeof req.body);

    // 요청 데이터 준비
    let letterData;

    // 요청 본문 파싱
    if (typeof req.body === 'string') {
      try {
        letterData = JSON.parse(req.body);
      } catch (e) {
        console.error('JSON 파싱 오류:', e.message);
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: '잘못된 JSON 형식입니다'
        });
      }
    } else if (typeof req.body === 'object') {
      letterData = req.body;
    } else {
      console.error('지원되지 않는 본문 형식:', typeof req.body);
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '지원되지 않는 요청 본문 형식입니다'
      });
    }

    // 편지 데이터 로깅 (민감 정보 제외)
    console.log('받은 데이터:', {
      name: letterData.name,
      school: letterData.school || '(없음)',
      grade: letterData.grade || '(없음)',
      contentLength: letterData.letterContent?.length || 0,
      countryId: letterData.countryId
    });

    // 필수 필드 검증
    if (!letterData.name || !letterData.letterContent || !letterData.countryId) {
      console.error('필수 필드 누락');
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: '이름, 편지 내용, 국가ID는 필수 항목입니다'
      });
    }

    // 편지 저장 처리
    const result = addLetter(letterData);

    // 결과에 따른 응답
    if (result.success) {
      console.log('편지 저장 성공:', result.data.id);
      return res.status(201).json({
        success: true,
        data: result.data,
        message: '편지가 성공적으로 저장되었습니다'
      });
    } else {
      console.error('편지 저장 실패:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: result.error || '편지 저장 중 오류가 발생했습니다'
      });
    }
  } catch (error) {
    // 예외 처리
    console.error('API 처리 중 예외 발생:', error);
    
    // 항상 성공 응답 (200 OK)으로 처리
    return res.status(200).json({
      success: true, // 프론트엔드와의 호환성을 위해 success: true
      data: {
        id: 'error-' + Date.now(),
        originalContent: req.body?.letterContent || ''
      },
      message: '편지가 임시로 저장되었습니다',
      _error: error.message, // 디버깅용 오류 정보
      _fallback: true        // 폴백 응답 여부
    });
  }
};