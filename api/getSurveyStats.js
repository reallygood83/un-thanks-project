// /api/getSurveyStats/[id] 엔드포인트 - 설문 통계 조회
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  console.log("[getSurveyStats API] 호출됨", { 
    method: req.method,
    query: req.query,
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

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      error: '설문 ID가 필요합니다'
    });
  }

  let client = null;

  try {
    console.log("[getSurveyStats API] 통계 조회 시작:", id);
    
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(DB_NAME);
    
    // ID 형식 확인 및 변환
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 설문 ID 형식입니다'
      });
    }
    
    // 설문 조회
    const surveysCollection = db.collection('surveys');
    const survey = await surveysCollection.findOne({ _id: objectId });
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        error: '설문을 찾을 수 없습니다'
      });
    }
    
    // 응답 통계 계산
    const responsesCollection = db.collection('surveyResponses');
    const responses = await responsesCollection.find({ surveyId: objectId }).toArray();
    
    // 질문별 통계 계산
    const stats = {
      surveyId: id,
      title: survey.title,
      totalResponses: responses.length,
      questions: survey.questions.map(question => {
        const questionStats = {
          id: question.id,
          text: question.text,
          type: question.type,
          stats: {}
        };
        
        if (question.type === 'multipleChoice' || question.type === 'checkbox') {
          // 선택형 질문 통계
          const optionCounts = {};
          question.options.forEach(option => {
            optionCounts[option] = 0;
          });
          
          responses.forEach(response => {
            const answer = response.responses[question.id];
            if (answer) {
              if (Array.isArray(answer)) {
                answer.forEach(option => {
                  if (optionCounts[option] !== undefined) {
                    optionCounts[option]++;
                  }
                });
              } else {
                if (optionCounts[answer] !== undefined) {
                  optionCounts[answer]++;
                }
              }
            }
          });
          
          questionStats.stats = optionCounts;
        } else if (question.type === 'rating') {
          // 평점 질문 통계
          const ratings = [];
          responses.forEach(response => {
            const answer = response.responses[question.id];
            if (answer && typeof answer === 'number') {
              ratings.push(answer);
            }
          });
          
          if (ratings.length > 0) {
            const sum = ratings.reduce((a, b) => a + b, 0);
            questionStats.stats = {
              average: sum / ratings.length,
              min: Math.min(...ratings),
              max: Math.max(...ratings),
              count: ratings.length
            };
          } else {
            questionStats.stats = {
              average: 0,
              min: 0,
              max: 0,
              count: 0
            };
          }
        } else {
          // 텍스트 질문의 경우 응답 수만 계산
          let count = 0;
          responses.forEach(response => {
            if (response.responses[question.id]) {
              count++;
            }
          });
          questionStats.stats = { responseCount: count };
        }
        
        return questionStats;
      })
    };
    
    console.log("[getSurveyStats API] 통계 조회 완료");

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[getSurveyStats API] 에러:', error);
    
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