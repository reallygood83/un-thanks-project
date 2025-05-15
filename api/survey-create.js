// /api/survey-create 엔드포인트
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[survey-create] 요청 받음', new Date().toISOString());
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Survey creation API is working',
      time: new Date().toISOString()
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      method: req.method
    });
  }
  
  // POST 요청 처리
  try {
    console.log('[survey-create] POST 요청 처리');
    console.log('[survey-create] Body:', JSON.stringify(req.body));
    
    const { title, description, questions, isActive, creationPassword } = req.body || {};
    
    // 간단한 응답 테스트
    if (title === 'test') {
      return res.status(200).json({
        success: true,
        message: 'Test successful',
        receivedData: req.body
      });
    }
    
    // 실제 설문 생성
    if (!title || !questions || !creationPassword) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          hasTitle: !!title,
          hasQuestions: !!questions,
          hasPassword: !!creationPassword
        }
      });
    }
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      client = await MongoClient.connect(MONGODB_URI);
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
    
  } catch (error) {
    console.error('[survey-create] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};