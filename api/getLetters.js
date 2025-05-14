// /api/getLetters 엔드포인트 - 편지/설문 목록 조회 (MongoDB 직접 연결 버전)
const { getLettersFromMongo } = require('./mongo-direct');
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

// 설문 생성 처리 함수
async function handleSurveyCreation(req, res) {
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
  } catch (error) {
    console.error('설문 생성 중 오류:', error);
    return res.status(500).json({
      success: false,
      error: '설문 생성 중 오류가 발생했습니다',
      message: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 편지 목록 조회 API 핸들러
module.exports = async (req, res) => {
  console.log('getLetters API 호출 (MongoDB 직접 연결):', req.method, req.url);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // POST 요청 처리 - 설문 생성
  if (req.method === 'POST') {
    console.log('설문 생성 POST 요청');
    return handleSurveyCreation(req, res);
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
    // 쿼리 파라미터 추출
    let countryId, page, limit, type;
    
    // URL 파싱 방식
    if (req.url) {
      try {
        const urlObj = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
        countryId = urlObj.searchParams.get('countryId');
        page = parseInt(urlObj.searchParams.get('page')) || 1;
        limit = parseInt(urlObj.searchParams.get('limit')) || 20;
        type = urlObj.searchParams.get('type');
      } catch (urlError) {
        console.warn('URL 파싱 오류, req.query 사용 시도:', urlError.message);
      }
    }
    
    // req.query 방식 (URL 파싱 실패시)
    if (typeof countryId === 'undefined' && req.query) {
      countryId = req.query.countryId;
      page = parseInt(req.query.page) || 1;
      limit = parseInt(req.query.limit) || 20;
      type = req.query.type;
    }
    
    // 기본값 설정
    page = page || 1;
    limit = limit || 20;
    
    console.log('목록 조회 파라미터 (MongoDB 직접 조회):', { countryId, page, limit, type });
    
    // type이 surveys인 경우 설문 조회
    if (type === 'surveys') {
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
        
        const surveys = await collection
          .find({ isActive: true })
          .sort({ createdAt: -1 })
          .toArray();
        
        console.log(`${surveys.length}개의 설문 조회됨`);
        
        return res.status(200).json({
          success: true,
          data: surveys.map(survey => {
            const { creationPassword, ...safeData } = survey;
            return safeData;
          }),
          total: surveys.length
        });
      } finally {
        if (client) {
          await client.close();
        }
      }
    }
    
    // 기본값: MongoDB에서 직접 편지 목록 조회
    const result = await getLettersFromMongo({ countryId, page, limit });
    
    // 결과 처리
    if (result.success) {
      console.log('편지 목록 MongoDB 조회 성공:', result.data.length);
      
      return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        pages: result.pages
      });
    } else {
      console.error('편지 목록 MongoDB 조회 실패:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error,
        message: '편지 목록 MongoDB 조회 중 오류가 발생했습니다'
      });
    }
  } catch (error) {
    console.error('getLetters MongoDB 처리 중 오류:', error);
    
    // 오류시 더미 데이터로 응답 (프론트엔드 호환성 유지)
    const dummyLetters = [
      {
        id: 'error-1',
        name: '홍길동',
        school: '서울초등학교',
        grade: '5학년',
        letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
        countryId: 'usa',
        createdAt: new Date().toISOString()
      },
      {
        id: 'error-2',
        name: '김철수',
        school: '부산중학교',
        grade: '2학년',
        letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
        countryId: 'uk',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    return res.status(200).json({
      success: true,
      data: dummyLetters,
      total: dummyLetters.length,
      page: 1,
      pages: 1,
      error: error.message,
      fallback: true,
      message: '오류 발생, 더미 데이터로 응답합니다'
    });
  }
};