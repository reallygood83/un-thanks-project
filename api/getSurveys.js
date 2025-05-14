// /api/getSurveys 엔드포인트 - 설문 목록 조회
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  console.log("[getSurveys API] 호출됨", { 
    method: req.method,
    headers: req.headers
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }

  let client = null;

  try {
    console.log("[getSurveys API] MongoDB 연결 시작");
    
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(DB_NAME);
    const collection = db.collection('surveys');
    
    const surveys = await collection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`[getSurveys API] ${surveys.length}개 설문 조회됨`);
    
    // 비밀번호 필드 제거
    const safeSurveys = surveys.map(survey => {
      const { creationPassword, ...safeData } = survey;
      return safeData;
    });

    return res.status(200).json({
      success: true,
      data: safeSurveys
    });
  } catch (error) {
    console.error('[getSurveys API] 에러:', error);
    
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