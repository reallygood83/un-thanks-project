// /api/getSurveys 엔드포인트 - 설문 목록 조회
const { getSurveysFromMongo } = require('./mongo-direct-survey');

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

// 설문 목록 조회 API 핸들러
module.exports = async (req, res) => {
  console.log('getSurveys API 호출:', req.method, req.url);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드',
      message: 'GET 요청만 허용됩니다'
    });
  }
  
  try {
    // MongoDB에서 설문 목록 조회
    const result = await getSurveysFromMongo();
    
    // 결과 처리
    if (result.success) {
      console.log('설문 목록 조회 성공:', result.data.length);
      
      return res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      console.error('설문 목록 조회 실패:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error,
        message: '설문 목록 조회 중 오류가 발생했습니다'
      });
    }
  } catch (error) {
    console.error('getSurveys 처리 중 오류:', error);
    
    // 오류시 더미 데이터로 응답
    const dummySurveys = [
      {
        _id: 'dummy-1',
        title: '미래 통일 한국의 모습에 대한 설문',
        description: '이 설문은 학생들이 생각하는 미래 통일 한국에 대해 조사합니다.',
        questions: [
          {
            id: 'q1',
            text: '통일 한국의 가장 큰 장점은 무엇이라고 생각하나요?',
            type: 'text',
            required: true
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    return res.status(200).json({
      success: true,
      data: dummySurveys,
      error: error.message,
      fallback: true,
      message: '오류 발생, 더미 데이터로 응답합니다'
    });
  }
};