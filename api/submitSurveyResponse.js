// /api/submitSurveyResponse 엔드포인트 - 설문 응답 제출
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  console.log("[submitSurveyResponse API] 호출됨", { 
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

  const { surveyId, responses } = req.body;
  
  if (!surveyId || !responses) {
    return res.status(400).json({
      success: false,
      error: '설문 ID와 응답이 필요합니다'
    });
  }

  let client = null;

  try {
    console.log("[submitSurveyResponse API] 응답 제출 시작:", { surveyId });
    
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(DB_NAME);
    
    // 설문 조회
    let objectId;
    try {
      objectId = new ObjectId(surveyId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 설문 ID 형식입니다'
      });
    }
    
    const surveysCollection = db.collection('surveys');
    const survey = await surveysCollection.findOne({ _id: objectId });
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        error: '설문을 찾을 수 없습니다'
      });
    }
    
    if (!survey.isActive) {
      return res.status(400).json({
        success: false,
        error: '이 설문은 더 이상 응답을 받지 않습니다'
      });
    }
    
    // 응답 저장
    const responsesCollection = db.collection('surveyResponses');
    
    const response = {
      surveyId: objectId,
      responses: responses,
      createdAt: new Date()
    };
    
    const result = await responsesCollection.insertOne(response);
    
    console.log("[submitSurveyResponse API] 응답 제출 완료:", result.insertedId);

    return res.status(200).json({
      success: true,
      message: '응답이 성공적으로 제출되었습니다',
      data: {
        responseId: result.insertedId
      }
    });
  } catch (error) {
    console.error('[submitSurveyResponse API] 에러:', error);
    
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