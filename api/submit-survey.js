// /api/submit-survey 엔드포인트 - 설문 전용
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  // 즉시 로그 출력
  console.log('[submit-survey] === API 호출됨 ===');
  console.log('[submit-survey] 시간:', new Date().toISOString());
  console.log('[submit-survey] 메서드:', req.method);
  
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('[submit-survey] 405 에러 - 메서드:', req.method);
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드',
      method: req.method
    });
  }

  try {
    console.log('[submit-survey] 본문 타입:', typeof req.body);
    console.log('[submit-survey] 본문 내용:', JSON.stringify(req.body).substring(0, 500));
    
    const { title, description, questions, isActive, creationPassword } = req.body || {};
    
    console.log('[submit-survey] 추출된 필드:', {
      hasTitle: !!title,
      hasDescription: !!description,
      hasQuestions: !!questions,
      questionsLength: questions?.length,
      hasPassword: !!creationPassword
    });
    
    // 필수 필드 검증
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
      console.log('[submit-survey] 필수 필드 누락');
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
    
    console.log('[submit-survey] MongoDB 연결 시작');
    
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
      
      // 저장할 설문 데이터
      const survey = {
        title,
        description,
        questions: questions.map(q => ({
          ...q,
          id: q.id || uuidv4()
        })),
        isActive: isActive !== false,
        creationPassword: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('[submit-survey] 설문 저장 시작');
      const result = await collection.insertOne(survey);
      
      console.log('[submit-survey] 설문 생성 성공:', result.insertedId);
      
      // 응답
      const responseData = {
        success: true,
        data: {
          _id: result.insertedId,
          ...survey,
          creationPassword: undefined
        }
      };
      
      console.log('[submit-survey] 응답 전송');
      return res.status(200).json(responseData);
      
    } catch (dbError) {
      console.error('[submit-survey] DB 오류:', dbError);
      throw dbError;
    } finally {
      if (client) {
        await client.close();
      }
    }
    
  } catch (error) {
    console.error('[submit-survey] 전체 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};