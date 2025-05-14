// /api/createSurvey 엔드포인트 - 설문 생성
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  console.log("[createSurvey API] 호출됨", { 
    method: req.method,
    body: req.body,
    headers: req.headers
  });

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
  
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0 || !creationPassword) {
    return res.status(400).json({
      success: false,
      error: '필수 필드가 누락되었습니다'
    });
  }

  let client = null;

  try {
    console.log("[createSurvey API] 설문 생성 시작");
    
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
    
    console.log("[createSurvey API] 설문 생성 완료:", result.insertedId);
    
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
    console.error('[createSurvey API] 에러:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}