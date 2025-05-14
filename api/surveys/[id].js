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

/**
 * 설문 수정
 */
async function updateSurvey(req, res, id) {
  try {
    const { db } = await connectToDatabase();
    const { password, ...updates } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }
    
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
    
    // 설문 조회
    const survey = await db.collection('surveys').findOne({ _id: objectId });
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }
    
    // 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
    
    if (!passwordMatch) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin password'
      });
    }
    
    // 수정 시간 업데이트
    updates.updatedAt = new Date();
    
    // 설문 업데이트
    const result = await db.collection('surveys').findOneAndUpdate(
      { _id: objectId },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update survey'
      });
    }
    
    // 비밀번호 필드 제외하고 반환
    const { creationPassword, ...updatedSurvey } = result.value;
    
    return res.status(200).json({
      success: true,
      data: updatedSurvey
    });
  } catch (error) {
    console.error(`Error updating survey ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update survey',
      error: error.message
    });
  }
}

/**
 * 설문 삭제
 */
async function deleteSurvey(req, res, id) {
  try {
    const { db } = await connectToDatabase();
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }
    
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
    
    // 설문 조회
    const survey = await db.collection('surveys').findOne({ _id: objectId });
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }
    
    // 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
    
    if (!passwordMatch) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin password'
      });
    }
    
    // 설문 삭제
    await db.collection('surveys').deleteOne({ _id: objectId });
    
    // 관련 응답도 함께 삭제
    await db.collection('surveyResponses').deleteMany({ surveyId: objectId });
    
    return res.status(200).json({
      success: true,
      message: 'Survey and all associated responses deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting survey ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete survey',
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
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Survey ID is required'
    });
  }

  // 요청 메서드에 따라 처리
  try {
    switch (req.method) {
      case 'GET':
        return await getSurveyById(req, res, id);
      case 'PUT':
        return await updateSurvey(req, res, id);
      case 'DELETE':
        return await deleteSurvey(req, res, id);
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