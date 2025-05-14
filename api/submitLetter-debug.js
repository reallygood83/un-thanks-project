// 디버깅용 submitLetter API
const { addLetterToMongo } = require('./mongo-direct');
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
  console.log('=== submitLetter-debug API 호출 시작 ===');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', req.query);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    const type = req.body.type || req.query?.type;
    console.log('Type 파라미터:', type);
    
    // 설문 생성 요청인 경우
    if (type === 'survey') {
      console.log('설문 생성 로직 시작');
      const { title, description, questions, isActive, creationPassword } = req.body;
      
      console.log('설문 필드:', { title, description, questionsLength: questions?.length, isActive, hasPassword: !!creationPassword });
      
      if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
        console.log('설문 필수 필드 누락');
        return res.status(400).json({
          success: false,
          error: '설문 필수 필드가 누락되었습니다',
          details: {
            hasTitle: !!title,
            hasQuestions: !!questions,
            isQuestionsArray: Array.isArray(questions),
            questionsLength: questions?.length || 0,
            hasPassword: !!creationPassword
          }
        });
      }
      
      console.log('설문 생성 진행중...');
      
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
        
        const hashedPassword = await bcrypt.hash(creationPassword, 10);
        
        const questionsWithIds = questions.map(q => ({
          ...q,
          id: q.id || uuidv4()
        }));
        
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
        
        const { creationPassword: _, ...responseData } = survey;
        
        return res.status(200).json({
          success: true,
          data: {
            _id: result.insertedId,
            ...responseData
          }
        });
      } finally {
        if (client) {
          await client.close();
        }
      }
    }
    
    console.log('편지 생성 로직 시작');
    
    // 편지 데이터 처리
    const { name, letterContent, countryId } = req.body;
    
    console.log('편지 필드:', { name, letterContentLength: letterContent?.length, countryId });
    
    // 편지 필수 필드 검증
    if (!name || !letterContent || !countryId) {
      console.log('편지 필수 필드 누락');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: '이름, 편지 내용, 국가ID는 필수 항목입니다',
        receivedData: {
          hasName: !!name,
          hasContent: !!letterContent,
          hasCountry: !!countryId,
          type: req.body.type
        }
      });
    }
    
    console.log('편지 생성 진행중...');
    
    const letterData = {
      name,
      letterContent,
      countryId,
      createdAt: new Date()
    };
    
    const result = await addLetterToMongo(letterData);
    
    if (result.success) {
      console.log('편지 생성 성공:', result.data.id);
      return res.status(201).json({
        success: true,
        data: {
          id: result.data.id,
          originalContent: letterContent
        }
      });
    } else {
      console.error('편지 생성 실패:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};