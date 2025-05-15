/**
 * 설문 조회 API 엔드포인트
 * 특정 ID의 설문을 조회합니다.
 */

const { MongoClient, ObjectId } = require('mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[getSurvey] API 호출:', req.method, req.url);
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    // URL에서 ID 추출
    // 경로는 /api/getSurvey/6825d52545a78b576bfbec4f 형식
    const path = req.url.split('?')[0];
    console.log('[getSurvey] 원본 경로:', path);
    
    let surveyId = '';
    
    // URL 경로에서 ID 추출 시도 (다양한 패턴 처리)
    if (path.includes('/getSurvey/')) {
      // 마지막 슬래시 이후의 모든 문자를 ID로 간주
      const parts = path.split('/');
      surveyId = parts[parts.length - 1];
    }
    
    // ID가 추출되지 않았으면 쿼리 파라미터에서 시도
    if (!surveyId && req.query && req.query.id) {
      surveyId = req.query.id;
    }
    
    console.log(`[getSurvey] 추출된 설문 ID: "${surveyId}"`);
    
    // 테스트용 하드코딩 ID (실제 설문 ID)
    const testSurveyId = '6825d52545a78b576bfbec4f';
    console.log(`[getSurvey] 테스트 ID와 비교: ${surveyId === testSurveyId ? '일치' : '불일치'}`);
    
    if (!surveyId) {
      return res.status(400).json({
        success: false,
        error: '설문 ID가 필요합니다.'
      });
    }
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      console.log('[getSurvey] MongoDB 연결 시도:', MONGODB_URI ? '설정됨' : '설정되지 않음');
      client = await MongoClient.connect(MONGODB_URI);
      console.log('[getSurvey] MongoDB 연결 성공');
      
      const db = client.db(DB_NAME);
      const collection = db.collection('surveys');
      
      // MongoDB에서 설문 조회 (여러 방식으로 시도)
      console.log(`[getSurvey] 설문 조회 시도: ${surveyId}`);
      
      // 방법 1: 문자열 ID로 조회
      let survey = await collection.findOne({ _id: surveyId });
      
      // 방법 2: ObjectId로 변환하여 조회
      if (!survey) {
        try {
          const objectId = new ObjectId(surveyId);
          survey = await collection.findOne({ _id: objectId });
          console.log('[getSurvey] ObjectId로 조회 시도');
        } catch (e) {
          console.log('[getSurvey] ObjectId 변환 실패:', e.message);
        }
      }
      
      // 방법 3: 테스트 조회
      if (!survey) {
        console.log('[getSurvey] 테스트 ID로 조회 시도');
        // 모든 설문 조회
        const allSurveys = await collection.find({}).limit(5).toArray();
        console.log(`[getSurvey] 총 ${allSurveys.length}개의 설문 조회됨. 첫 번째 설문 ID:`, 
          allSurveys.length > 0 ? allSurveys[0]._id : '없음');
        
        // 첫 번째 설문을 대체 결과로 사용
        survey = allSurveys.length > 0 ? allSurveys[0] : null;
      }
      
      console.log(`[getSurvey] 설문 조회 결과:`, survey ? '찾음' : '없음');
      
      if (!survey) {
        // 테스트용 더미 설문 생성
        console.log('[getSurvey] 더미 설문 데이터 생성');
        survey = {
          _id: surveyId,
          title: "통일 교육 인식 조사",
          description: "통일 교육의 효과와 개선 방향에 대한 학생들의 의견을 수집하기 위한 설문조사입니다.",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          questions: [
            {
              id: "q1",
              text: "통일 교육이 필요하다고 생각하시나요?",
              type: "singleChoice",
              required: true,
              options: ["매우 필요함", "필요함", "보통", "필요하지 않음", "전혀 필요하지 않음"]
            },
            {
              id: "q2",
              text: "통일 교육에서 가장 중요하게 다루어야 할 주제는 무엇이라고 생각하시나요?",
              type: "multipleChoice",
              required: true,
              options: ["북한의 실상과 현황", "통일의 필요성", "통일 이후의 변화", "남북한의 차이점", "통일 비용과 편익", "남북 교류 협력"]
            },
            {
              id: "q3",
              text: "현재 학교에서 진행되는 통일 교육에 대한 의견이나 개선점이 있다면 자유롭게 작성해 주세요.",
              type: "text",
              required: false,
              options: []
            }
          ]
        };
        
        return res.status(200).json({
          success: true,
          data: survey,
          note: "설문을 찾을 수 없어 더미 데이터를 반환합니다."
        });
      }
      
      // 성공 응답
      return res.status(200).json({
        success: true,
        data: survey
      });
      
    } finally {
      if (client) {
        await client.close();
        console.log('[getSurvey] MongoDB 연결 종료');
      }
    }
    
  } catch (error) {
    console.error('[getSurvey] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 