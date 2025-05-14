// 설문 생성 전용 API (편지와 완전히 분리)
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  const { title, description, questions, isActive, creationPassword } = req.body;
  
  // 필수 필드 검증
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
    return res.status(400).json({
      success: false,
      error: '필수 필드가 누락되었습니다',
      required: ['title', 'questions', 'creationPassword'],
      received: Object.keys(req.body)
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
    
    return res.status(200).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...responseData
      }
    });
  } catch (error) {
    console.error('설문 생성 오류:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};