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
  console.log('[submit-letter] API 호출:', req.method);
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    const { type } = req.body || {};
    console.log('[submit-letter] 요청 타입:', type);
    
    // 설문 생성 요청 처리
    if (type === 'survey') {
      console.log('[submit-letter] 설문 생성 요청');
      const { title, description, questions, isActive, creationPassword } = req.body;
      
      if (!title || !questions || !creationPassword) {
        return res.status(400).json({
          success: false,
          error: '필수 필드가 누락되었습니다'
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
    }
    
    // 편지 처리
    const { name, letterContent, countryId } = req.body;
    
    if (!name || !letterContent || !countryId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    console.log('[submit-letter] 편지 처리 시작, DB:', DB_NAME);
    
    let client = null;
    
    try {
      client = await MongoClient.connect(MONGODB_URI);
      const db = client.db(DB_NAME);
      const collection = db.collection('letters');
      
      const letter = {
        name,
        letterContent,
        countryId,
        createdAt: new Date()
      };
      
      const result = await collection.insertOne(letter);
      
      return res.status(201).json({
        success: true,
        data: {
          id: result.insertedId,
          ...letter
        }
      });
      
    } finally {
      if (client) {
        await client.close();
      }
    }
    
  } catch (error) {
    console.error('[submit-letter] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};