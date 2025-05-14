const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

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
 * 비밀번호 검증
 */
async function verifyPassword(req, res, surveyId) {
  try {
    const { db } = await connectToDatabase();
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    // ID 유효성 검증
    let objectId;
    try {
      objectId = new ObjectId(surveyId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid survey ID format'
      });
    }
    
    // 설문 조회
    const survey = await db.collection('surveys').findOne({ _id: objectId });
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }
    
    // 비밀번호 검증
    const isValid = await bcrypt.compare(password, survey.creationPassword);
    
    return res.status(200).json({
      success: isValid,
      message: isValid ? 'Password verified' : 'Invalid password'
    });
  } catch (error) {
    console.error(`Error verifying password for survey ${surveyId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify password',
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

  // URL에서 ID 추출
  const surveyId = req.query.id;

  if (!surveyId) {
    return res.status(400).json({
      success: false,
      message: 'Survey ID is required'
    });
  }

  // 요청 메서드에 따라 처리
  try {
    switch (req.method) {
      case 'POST':
        return await verifyPassword(req, res, surveyId);
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