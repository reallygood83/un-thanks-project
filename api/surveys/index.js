const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// MongoDB 연결 정보
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'unthanks-db';

// MongoDB 클라이언트
let cachedClient = null;
let cachedDb = null;

// 연결 함수
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    throw new Error('MongoDB URI가 설정되지 않았습니다.');
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

/**
 * 요청 처리 함수 - 모든 설문 조회
 */
async function getAllSurveys(req, res) {
  try {
    const { db } = await connectToDatabase();
    const includeInactive = req.query.includeInactive === 'true';
    
    const query = includeInactive ? {} : { isActive: true };
    const surveys = await db.collection('surveys').find(query).sort({ createdAt: -1 }).toArray();
    
    return res.status(200).json({
      success: true,
      data: surveys.map(survey => ({
        _id: survey._id,
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
        isActive: survey.isActive,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting surveys:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch surveys',
      error: error.message
    });
  }
}

/**
 * 요청 처리 함수 - 새 설문 생성
 */
async function createSurvey(req, res) {
  try {
    const { db } = await connectToDatabase();
    const { title, description, questions, creationPassword } = req.body;
    
    // 필수 필드 검증
    if (!title || !description || !questions || !creationPassword) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, questions, creationPassword'
      });
    }
    
    // 모든 질문 유효성 검증
    for (const question of questions) {
      if (!question.text || !question.type) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have text and type fields'
        });
      }
      
      // multipleChoice 타입인 경우 options 필수
      if (question.type === 'multipleChoice' && (!question.options || question.options.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have options'
        });
      }
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(creationPassword, 10);
    
    // 질문 ID 할당
    const questionsWithIds = questions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    }));
    
    // 새 설문 생성
    const now = new Date();
    const newSurvey = {
      title,
      description,
      questions: questionsWithIds,
      isActive: req.body.isActive ?? true,
      creationPassword: hashedPassword,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection('surveys').insertOne(newSurvey);
    
    return res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        title: newSurvey.title,
        description: newSurvey.description,
        questions: newSurvey.questions,
        isActive: newSurvey.isActive,
        createdAt: newSurvey.createdAt,
        updatedAt: newSurvey.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create survey',
      error: error.message
    });
  }
}

// API 라우터
module.exports = async (req, res) => {
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
    res.status(200).end();
    return;
  }

  // 요청 메서드에 따라 처리
  try {
    switch (req.method) {
      case 'GET':
        return await getAllSurveys(req, res);
      case 'POST':
        return await createSurvey(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};