// 설문 응답 API - 응답 제출 처리
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../../_lib/mongodb');

/**
 * 설문 응답 API 핸들러
 */
module.exports = async (req, res) => {
  // URL에서 ID 파라미터 추출
  const surveyId = req.query.id;
  
  console.log(`[설문 응답 API] ${req.method} /api/survey/${surveyId}/responses`);
  
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
    return res.status(200).end();
  }

  // ID 유효성 검증
  if (!surveyId) {
    return res.status(400).json({
      success: false,
      message: 'Survey ID is required'
    });
  }
  
  try {
    // MongoDB ID 형식 확인 및 변환
    let objectId;
    try {
      objectId = new ObjectId(surveyId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid survey ID format'
      });
    }
    
    // 데이터베이스 연결
    const { db } = await connectToDatabase();
    
    // POST 요청 - 응답 제출
    if (req.method === 'POST') {
      const { respondentInfo, answers } = req.body;
      
      // 응답 데이터 유효성 검사
      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Answers are required'
        });
      }
      
      // 설문 조회
      const survey = await db.collection('surveys').findOne({ _id: objectId });
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }
      
      // 설문이 활성화 상태인지 확인
      if (!survey.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This survey is no longer accepting responses'
        });
      }
      
      // 필수 질문에 대한 응답 확인
      const requiredQuestions = survey.questions
        .filter(q => q.required)
        .map(q => q.id);
      
      const answeredQuestions = answers.map(a => a.questionId);
      
      const missingRequiredAnswers = requiredQuestions.filter(
        qId => !answeredQuestions.includes(qId)
      );
      
      if (missingRequiredAnswers.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing answers for required questions: ${missingRequiredAnswers.join(', ')}`
        });
      }
      
      // 컬렉션 존재 여부 확인 및 생성
      const collections = await db.listCollections({ name: 'surveyResponses' }).toArray();
      if (collections.length === 0) {
        await db.createCollection('surveyResponses');
        console.log('[설문 응답 API] surveyResponses 컬렉션 생성 완료');
      }
      
      // 응답 저장
      const response = {
        surveyId: objectId,
        respondentInfo: respondentInfo || {},
        answers,
        createdAt: new Date()
      };
      
      const result = await db.collection('surveyResponses').insertOne(response);
      
      return res.status(201).json({
        success: true,
        data: {
          responseId: result.insertedId
        }
      });
    }
    
    // 다른 메소드는 허용하지 않음
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
    
  } catch (error) {
    console.error(`[설문 응답 API] 오류 (SurveyID: ${surveyId}):`, error);
    
    // 클라이언트에게 오류 응답
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};