const { MongoClient } = require('mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[get-letters] API 호출:', req.method);
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    const { type, countryId } = req.query;
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      client = await MongoClient.connect(MONGODB_URI);
      const db = client.db(DB_NAME);
      
      // 설문 목록 요청
      if (type === 'surveys') {
        const collection = db.collection('surveys');
        const surveys = await collection.find({ isActive: true }).toArray();
        
        return res.status(200).json({
          success: true,
          data: surveys
        });
      }
      
      // 편지 목록 요청
      const collection = db.collection('letters');
      const query = countryId ? { countryId } : {};
      const letters = await collection.find(query).sort({ createdAt: -1 }).toArray();
      
      return res.status(200).json({
        success: true,
        data: letters
      });
      
    } finally {
      if (client) {
        await client.close();
      }
    }
    
  } catch (error) {
    console.error('[get-letters] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};