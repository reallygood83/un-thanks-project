// 개선된 submitLetter API - 설문 생성 문제 해결
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
  console.log('submitLetter-fixed API 호출:', req.method);
  console.log('Request body:', JSON.stringify(req.body));
  
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
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: '요청 본문이 비어있습니다'
      });
    }
    
    // type 파라미터 확인 - body와 query 모두 확인
    const type = req.body.type || req.query?.type;
    console.log('Type:', type);
    
    // 설문 생성 요청인 경우
    if (type === 'survey') {
      console.log('설문 생성 처리 시작');
      const { title, description, questions, isActive, creationPassword } = req.body;
      
      // 필수 필드 검증
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!questions) missingFields.push('questions');
      if (!Array.isArray(questions)) missingFields.push('questions must be an array');
      if (questions && questions.length === 0) missingFields.push('questions cannot be empty');
      if (!creationPassword) missingFields.push('creationPassword');
      
      if (missingFields.length > 0) {
        console.log('필수 필드 누락:', missingFields);
        return res.status(400).json({
          success: false,
          error: '필수 필드가 누락되었습니다',
          missingFields: missingFields
        });
      }
      
      const MONGODB_URI = process.env.MONGODB_URI;
      const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
      
      let client = null;
      
      try {
        console.log('MongoDB 연결 시도');
        client = await MongoClient.connect(MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        
        const db = client.db(DB_NAME);
        const collection = db.collection('surveys');
        
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
        
        console.log('설문 저장 시도');
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
      } catch (dbError) {
        console.error('MongoDB 오류:', dbError);
        throw dbError;
      } finally {
        if (client) {
          await client.close();
          console.log('MongoDB 연결 종료');
        }
      }
    }
    
    // 편지 생성 로직
    console.log('편지 생성 처리 시작');
    const { name, letterContent, countryId } = req.body;
    
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