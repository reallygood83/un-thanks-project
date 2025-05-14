// 설문 API - 통합 엔드포인트
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { connectToDatabase, sampleSurveys, validateSurveyData } = require('./_lib/mongodb');

/**
 * 설문 API 통합 핸들러
 * 모든 설문 관련 요청을 처리하는 단일 엔드포인트
 */
module.exports = async (req, res) => {
  console.log(`[설문 통합 API] ${req.method} ${req.url}`);
  
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

  try {
    // 데이터베이스 연결
    const { db } = await connectToDatabase();
    
    // 컬렉션 존재 여부 확인 및 생성
    const collections = await db.listCollections({ name: 'surveys' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('surveys');
      
      // 샘플 데이터 추가
      if (sampleSurveys && sampleSurveys.length > 0) {
        await db.collection('surveys').insertMany(sampleSurveys);
        console.log('[설문 통합 API] surveys 컬렉션 생성 및 샘플 데이터 추가 완료');
      }
    }
    
    // URL 경로 분석
    const path = req.url.replace(/\?.*$/, ''); // 쿼리 파라미터 제거
    const pathParts = path.split('/').filter(Boolean);
    
    console.log(`[설문 통합 API] 경로 분석:`, {
      originalPath: req.url,
      cleanPath: path,
      parts: pathParts
    });
    
    // ==================== 설문 목록 및 생성 (루트 경로) ====================
    if (pathParts.length === 2 && (pathParts[1] === 'survey' || pathParts[1] === 'surveys')) {
      // GET 요청 - 설문 목록 조회
      if (req.method === 'GET') {
        // 쿼리 파라미터
        const includeInactive = req.query.includeInactive === 'true';
        
        // 활성화된 설문만 가져올지 여부에 따라 쿼리 설정
        const query = includeInactive ? {} : { isActive: true };
        
        // 설문 목록 조회
        const surveys = await db.collection('surveys')
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        
        return res.status(200).json({
          success: true,
          data: surveys.map(survey => {
            // 비밀번호 필드 제외
            const { creationPassword, ...publicData } = survey;
            return publicData;
          })
        });
      }
      
      // POST 요청 - 새 설문 생성
      if (req.method === 'POST') {
        const surveyData = req.body;
        
        // 데이터 유효성 검사
        if (!validateSurveyData(surveyData)) {
          return res.status(400).json({
            success: false,
            message: '필수 필드가 누락되었습니다: title, description, questions, creationPassword'
          });
        }
        
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(surveyData.creationPassword, 10);
        
        // 질문 ID 생성
        const questionsWithIds = surveyData.questions.map(q => ({
          ...q,
          id: q.id || uuidv4()
        }));
        
        // 새 설문 데이터 구성
        const now = new Date();
        const newSurvey = {
          title: surveyData.title,
          description: surveyData.description,
          questions: questionsWithIds,
          isActive: surveyData.isActive !== false, // 기본값 true
          creationPassword: hashedPassword,
          createdAt: now,
          updatedAt: now
        };
        
        // 데이터베이스에 저장
        const result = await db.collection('surveys').insertOne(newSurvey);
        
        // 비밀번호 필드 제외한 응답 반환
        const { creationPassword, ...responseData } = newSurvey;
        
        return res.status(201).json({
          success: true,
          data: {
            _id: result.insertedId,
            ...responseData
          }
        });
      }
    }
    
    // ==================== 특정 설문 조회, 수정, 삭제 ====================
    if (pathParts.length === 3 && (pathParts[1] === 'survey' || pathParts[1] === 'surveys')) {
      const surveyId = pathParts[2];
      
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
      
      // GET 요청 - 설문 상세 조회
      if (req.method === 'GET') {
        const survey = await db.collection('surveys').findOne({ _id: objectId });
        
        if (!survey) {
          return res.status(404).json({
            success: false,
            message: 'Survey not found'
          });
        }
        
        // 비밀번호 필드 제외한 데이터 반환
        const { creationPassword, ...surveyData } = survey;
        
        return res.status(200).json({
          success: true,
          data: surveyData
        });
      }
      
      // PUT 요청 - 설문 수정
      if (req.method === 'PUT') {
        const { password, ...updates } = req.body;
        
        if (!password) {
          return res.status(400).json({
            success: false,
            message: 'Admin password is required'
          });
        }
        
        // 기존 설문 조회
        const survey = await db.collection('surveys').findOne({ _id: objectId });
        
        if (!survey) {
          return res.status(404).json({
            success: false,
            message: 'Survey not found'
          });
        }
        
        // 비밀번호 검증
        const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
        
        if (!passwordMatch) {
          return res.status(403).json({
            success: false,
            message: 'Invalid admin password'
          });
        }
        
        // 업데이트 시간 추가
        updates.updatedAt = new Date();
        
        // 설문 업데이트
        const result = await db.collection('surveys').findOneAndUpdate(
          { _id: objectId },
          { $set: updates },
          { returnDocument: 'after' }
        );
        
        // 비밀번호 필드 제외한 업데이트된 설문 반환
        const { creationPassword, ...updatedData } = result.value;
        
        return res.status(200).json({
          success: true,
          data: updatedData
        });
      }
      
      // DELETE 요청 - 설문 삭제
      if (req.method === 'DELETE') {
        const { password } = req.body;
        
        if (!password) {
          return res.status(400).json({
            success: false,
            message: 'Admin password is required'
          });
        }
        
        // 기존 설문 조회
        const survey = await db.collection('surveys').findOne({ _id: objectId });
        
        if (!survey) {
          return res.status(404).json({
            success: false,
            message: 'Survey not found'
          });
        }
        
        // 비밀번호 검증
        const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
        
        if (!passwordMatch) {
          return res.status(403).json({
            success: false,
            message: 'Invalid admin password'
          });
        }
        
        // 설문 삭제
        await db.collection('surveys').deleteOne({ _id: objectId });
        
        // 관련 응답도 함께 삭제
        await db.collection('surveyResponses').deleteMany({ surveyId: objectId });
        
        return res.status(200).json({
          success: true,
          message: 'Survey and all associated responses deleted successfully'
        });
      }
    }
    
    // ==================== 설문 응답 제출 ====================
    if (pathParts.length === 4 && (pathParts[1] === 'survey' || pathParts[1] === 'surveys') && pathParts[3] === 'responses') {
      const surveyId = pathParts[2];
      
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
    }
    
    // ==================== 설문 결과 조회 ====================
    if (pathParts.length === 4 && (pathParts[1] === 'survey' || pathParts[1] === 'surveys') && pathParts[3] === 'results') {
      const surveyId = pathParts[2];
      
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
      
      // GET 요청 - 결과 조회
      if (req.method === 'GET') {
        // 쿼리 파라미터
        const password = req.query.password;
        const includeResponses = Boolean(password);
        
        // 설문 조회
        const survey = await db.collection('surveys').findOne({ _id: objectId });
        
        if (!survey) {
          return res.status(404).json({
            success: false,
            message: 'Survey not found'
          });
        }
        
        // 비밀번호 검증 (개별 응답 조회를 위해)
        let responses;
        if (includeResponses) {
          const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
          
          if (!passwordMatch) {
            return res.status(403).json({
              success: false,
              message: 'Invalid admin password'
            });
          }
          
          // 개별 응답 조회
          responses = await db.collection('surveyResponses')
            .find({ surveyId: objectId })
            .toArray();
        }
        
        // 응답 데이터 조회
        const allResponses = await db.collection('surveyResponses')
          .find({ surveyId: objectId })
          .toArray();
        
        const totalResponses = allResponses.length;
        
        // 질문별 통계
        const questionStats = survey.questions.map(question => {
          const allAnswers = allResponses
            .map(r => r.answers.find(a => a.questionId === question.id)?.value)
            .filter(Boolean);
          
          let answerDistribution = {};
          
          if (question.type === 'multipleChoice' && question.options) {
            // 선택지별 카운트
            question.options.forEach(option => {
              answerDistribution[option] = allAnswers.filter(a => a === option).length;
            });
          } else if (question.type === 'scale') {
            // 척도 평균
            const numericAnswers = allAnswers.map(a => Number(a)).filter(n => !isNaN(n));
            const sum = numericAnswers.reduce((acc, val) => acc + val, 0);
            answerDistribution = {
              average: numericAnswers.length > 0 ? sum / numericAnswers.length : 0,
              counts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({
                value: n,
                count: numericAnswers.filter(a => a === n).length
              }))
            };
          } else {
            // 텍스트 응답의 경우 단순 리스트
            answerDistribution = allAnswers;
          }
          
          return {
            questionId: question.id,
            questionText: question.text,
            answerDistribution
          };
        });
        
        // AI 분석 결과 (실제로는 별도 API 연동 필요)
        const aiSummary = totalResponses > 0 
          ? '이 AI 요약은 실제 Gemini API 통합 시 제공될 예정입니다.'
          : undefined;
        
        // 비밀번호 필드 제외
        const { creationPassword, ...surveyData } = survey;
        
        return res.status(200).json({
          success: true,
          data: {
            survey: surveyData,
            responses,
            analytics: {
              totalResponses,
              questionStats,
              aiSummary
            }
          }
        });
      }
    }
    
    // ==================== 비밀번호 검증 ====================
    if (pathParts.length === 4 && (pathParts[1] === 'survey' || pathParts[1] === 'surveys') && pathParts[3] === 'verify') {
      const surveyId = pathParts[2];
      
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
      
      // POST 요청 - 비밀번호 검증
      if (req.method === 'POST') {
        const { password } = req.body;
        
        if (!password) {
          return res.status(400).json({
            success: false,
            message: 'Password is required'
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
        
        // 비밀번호 검증
        const isValid = await bcrypt.compare(password, survey.creationPassword);
        
        return res.status(200).json({
          success: isValid,
          message: isValid ? 'Password verified' : 'Invalid password'
        });
      }
    }
    
    // 일치하는 경로가 없는 경우
    return res.status(404).json({
      success: false,
      message: 'Endpoint not found',
      path: path,
      method: req.method
    });
    
  } catch (error) {
    console.error('[설문 통합 API] 오류:', error);
    
    // 클라이언트에게 오류 응답
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};