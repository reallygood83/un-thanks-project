// /api/submitLetter 엔드포인트 - 편지/설문 제출 처리 (MongoDB 직접 연결 버전)
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

// 편지/설문 제출 API 핸들러
module.exports = async (req, res) => {
  console.log('submitLetter API 호출 (편지/설문):', req.method);
  
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
    console.log('submitLetter 요청 받음:', {
      method: req.method,
      body: req.body,
      query: req.query,
      headers: req.headers['content-type']
    });
    
    // 요청 본문 확인
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: '요청 본문이 비어있습니다'
      });
    }
    
    // type 파라미터 확인
    const type = req.body.type || req.query?.type;
    console.log('요청 타입:', type);
    
    // 설문 생성 요청인 경우
    if (type === 'survey') {
      console.log('설문 생성 요청 감지');
      const { title, description, questions, isActive, creationPassword } = req.body;
      
      console.log('설문 필드 추출:', {
        title,
        description,
        questionsCount: questions?.length,
        isActive,
        hasPassword: !!creationPassword
      });
      
      if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
        console.log('필수 필드 누락 오류');
        return res.status(400).json({
          success: false,
          error: '필수 필드가 누락되었습니다',
          details: {
            hasTitle: !!title,
            hasQuestions: !!questions,
            isQuestionsArray: Array.isArray(questions),
            questionsLength: questions?.length || 0,
            hasPassword: !!creationPassword,
            receivedData: Object.keys(req.body)
          }
        });
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
        
        // MongoDB에 저장
        const result = await collection.insertOne(survey);
        
        console.log('설문 생성 성공:', result.insertedId);
        
        // 비밀번호 필드 제거한 응답 데이터
        const { creationPassword: _, ...responseData } = survey;
        
        const responsePayload = {
          success: true,
          data: {
            _id: result.insertedId,
            ...responseData
          }
        };
        
        console.log('설문 생성 응답:', JSON.stringify(responsePayload));
        return res.status(200).json(responsePayload);
      } finally {
        if (client) {
          await client.close();
        }
      }
    }
    
    // 편지 데이터 추출 (여러 형태의 필드명 지원)
    const { 
      name, sender, 
      school, affiliation, 
      grade, 
      letterContent, message, 
      countryId, country 
    } = req.body;
    
    // 필드명 호환성 처리
    const writerName = name || sender || '';
    const writerSchool = school || affiliation || '';
    const content = letterContent || message || '';
    const targetCountry = countryId || country || '';
    
    console.log('편지 데이터 수신 (MongoDB 직접 저장):', { 
      name: writerName, 
      school: writerSchool || '(없음)', 
      grade: grade || '(없음)', 
      contentLength: content?.length || 0,
      countryId: targetCountry,
      originalRequest: JSON.stringify(req.body).substring(0, 200) // 디버깅용 원본 요청 일부
    });
    
    // 설문인 경우 편지 처리 건너뛰고 위에서 이미 처리됨
    if (type === 'survey') {
      // 이미 위에서 설문 처리가 완료됨
      return;
    }
    
    // 편지 필수 필드 검증
    if (!writerName || !content || !targetCountry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: '이름, 편지 내용, 국가ID는 필수 항목입니다',
        receivedData: {
          hasName: !!writerName,
          hasContent: !!content,
          hasCountry: !!targetCountry,
          type: req.body.type
        }
      });
    }
    
    // 편지 데이터 구성 (호환성 확보)
    const letterData = {
      name: writerName,
      sender: writerName,
      school: writerSchool,
      affiliation: writerSchool,
      grade: grade || '',
      letterContent: content,
      message: content,
      countryId: targetCountry,
      country: targetCountry,
      createdAt: new Date()
    };
    
    // MongoDB에 직접 편지 저장
    const result = await addLetterToMongo(letterData);
    
    // 결과 처리
    if (result.success) {
      console.log('편지 MongoDB 저장 성공:', result.data.id);
      return res.status(201).json({
        success: true,
        data: {
          id: result.data.id,
          originalContent: letterContent
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
    console.error('submitLetter MongoDB 처리 중 오류:', error);
    
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};