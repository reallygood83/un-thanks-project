// /api/submitLetter-v2 엔드포인트 - Vercel 표준 형식
const { addLetterToMongo } = require('./mongo-direct');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
  console.log('[submitLetter-v2] 요청 시작:', {
    method: req.method,
    hasBody: !!req.body,
    bodyType: typeof req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    contentType: req.headers['content-type']
  });

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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
    const { type } = req.body || {};
    console.log('[submitLetter-v2] 요청 타입:', type);
    console.log('[submitLetter-v2] 요청 본문:', JSON.stringify(req.body).substring(0, 500));

    // 설문 생성 요청인 경우
    if (type === 'survey') {
      console.log('[submitLetter-v2] 설문 생성 프로세스 시작');
      const { title, description, questions, isActive, creationPassword } = req.body;
      
      if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
        return res.status(400).json({
          success: false,
          error: '필수 필드가 누락되었습니다',
          details: {
            hasTitle: !!title,
            hasQuestions: !!questions,
            hasPassword: !!creationPassword,
            questionsCount: questions?.length || 0
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
        
        const hashedPassword = await bcrypt.hash(creationPassword, 10);
        const survey = {
          title,
          description,
          questions,
          isActive: isActive !== false,
          creationPassword: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await collection.insertOne(survey);
        console.log('[submitLetter-v2] 설문 생성 성공:', result.insertedId);
        
        return res.status(200).json({
          success: true,
          data: {
            _id: result.insertedId,
            ...survey,
            creationPassword: undefined
          }
        });
      } finally {
        if (client) {
          await client.close();
        }
      }
    }

    // 편지 처리 로직
    const { name, letterContent, countryId } = req.body;
    
    if (!name || !letterContent || !countryId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          hasName: !!name,
          hasContent: !!letterContent,
          hasCountry: !!countryId,
          receivedType: type,
          allKeys: Object.keys(req.body || {})
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
      return res.status(201).json({
        success: true,
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('[submitLetter-v2] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
}