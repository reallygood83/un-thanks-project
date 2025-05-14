// 설문 통합 처리 API
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

module.exports = async (req, res) => {
  console.log('survey-handler API 호출:', req.method);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const MONGODB_URI = process.env.MONGODB_URI;
  const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
  
  let client = null;
  
  try {
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(DB_NAME);
    const collection = db.collection('surveys');
    
    // GET 요청 - 설문 목록 조회
    if (req.method === 'GET') {
      const surveys = await collection
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`${surveys.length}개의 설문 조회됨`);
      
      // 비밀번호 필드 제거
      const safeSurveys = surveys.map(survey => {
        const { creationPassword, ...safeData } = survey;
        return safeData;
      });
      
      return res.status(200).json({
        success: true,
        data: safeSurveys,
        total: safeSurveys.length
      });
    }
    
    // POST 요청 - 설문 생성
    if (req.method === 'POST') {
      const { title, description, questions, isActive, creationPassword } = req.body;
      
      // 필수 필드 검증
      if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
        return res.status(400).json({
          success: false,
          error: '필수 필드가 누락되었습니다',
          details: {
            hasTitle: !!title,
            hasQuestions: !!questions,
            isQuestionsArray: Array.isArray(questions),
            questionsLength: questions?.length || 0,
            hasPassword: !!creationPassword
          }
        });
      }
      
      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(creationPassword, 10);
      
      // 질문 ID 할당
      const questionsWithIds = questions.map(q => ({
        ...q,
        id: q.id || uuidv4()
      }));
      
      // 저장할 문서 생성
      const survey = {
        title,
        description,
        questions: questionsWithIds,
        isActive: isActive !== false,
        creationPassword: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(survey);
      
      console.log('설문 생성 성공:', result.insertedId);
      
      // 비밀번호 필드 제거한 응답
      const { creationPassword: _, ...responseData } = survey;
      
      return res.status(200).json({
        success: true,
        data: {
          _id: result.insertedId,
          ...responseData
        }
      });
    }
    
    // 지원하지 않는 메서드
    return res.status(405).json({
      success: false,
      error: '지원하지 않는 메서드입니다'
    });
    
  } catch (error) {
    console.error('survey-handler API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};