// 설문 API - 설문 목록 및 생성 처리
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { connectToDatabase, sampleSurveys, validateSurveyData } = require('../_lib/mongodb');

/**
 * 설문 API 핸들러
 */
module.exports = async (req, res) => {
  console.log(`[설문 API] ${req.method} /api/survey`);
  
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
    const collection = db.collection('surveys');
    
    // 컬렉션 존재 여부 확인
    const collections = await db.listCollections({ name: 'surveys' }).toArray();
    if (collections.length === 0) {
      // 컬렉션이 없으면 생성하고 샘플 데이터 추가
      await db.createCollection('surveys');
      if (sampleSurveys && sampleSurveys.length > 0) {
        await collection.insertMany(sampleSurveys);
        console.log('[설문 API] surveys 컬렉션 생성 및 샘플 데이터 추가 완료');
      }
    }
    
    // GET 요청 - 설문 목록 조회
    if (req.method === 'GET') {
      // 쿼리 파라미터
      const includeInactive = req.query.includeInactive === 'true';
      
      // 활성화된 설문만 가져올지 여부에 따라 쿼리 설정
      const query = includeInactive ? {} : { isActive: true };
      
      // 설문 목록 조회
      const surveys = await collection.find(query)
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
      const result = await collection.insertOne(newSurvey);
      
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
    
    // 다른 메소드는 허용하지 않음
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
    
  } catch (error) {
    console.error('[설문 API] 오류:', error);
    
    // 클라이언트에게 오류 응답
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};