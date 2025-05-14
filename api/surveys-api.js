// 모든 HTTP 메서드에 대응하는 단일 API 엔드포인트
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

/**
 * ID로 특정 설문 조회
 */
async function getSurveyById(req, res, id) {
  try {
    const { db } = await connectToDatabase();
    
    // ID 유효성 검증
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid survey ID format'
      });
    }
    
    const survey = await db.collection('surveys').findOne({ _id: objectId });
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }
    
    // 비밀번호 필드 제외하고 반환
    const { creationPassword, ...surveyData } = survey;
    
    return res.status(200).json({
      success: true,
      data: surveyData
    });
  } catch (error) {
    console.error(`Error getting survey ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch survey',
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

  // 요청 로깅
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    query: req.query,
    headers: req.headers,
    body: req.body ? '있음' : '없음'
  });

  // 경로에서 설문 ID 추출 (있는 경우)
  const path = req.url.split('?')[0];
  const pathParts = path.split('/').filter(Boolean);
  
  // 전체 요청 경로 출력
  console.log('Full path:', path);
  console.log('Path parts:', pathParts);

  // ID가 있는 경우 vs 루트 경로 분기 처리
  try {
    // 기본 /api/surveys 경로 처리
    if (pathParts.length === 1 || pathParts[1] === '') {
      switch (req.method) {
        case 'GET':
          return await getAllSurveys(req, res);
        case 'POST':
          return await createSurvey(req, res);
        default:
          return res.status(405).json({
            success: false,
            message: `Method ${req.method} Not Allowed for this endpoint`
          });
      }
    } 
    // ID가 있는 경로 /api/surveys/:id 처리
    else if (pathParts.length === 2) {
      const surveyId = pathParts[1];
      
      switch (req.method) {
        case 'GET':
          return await getSurveyById(req, res, surveyId);
        default:
          return res.status(405).json({
            success: false,
            message: `Method ${req.method} Not Allowed for this endpoint`
          });
      }
    }
    // 그 외 경로는 404 반환
    else {
      return res.status(404).json({
        success: false,
        message: 'Endpoint not found'
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