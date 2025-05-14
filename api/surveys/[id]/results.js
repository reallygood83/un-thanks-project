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
 * 설문 결과 조회
 */
async function getSurveyResults(req, res, surveyId) {
  try {
    const { db } = await connectToDatabase();
    const password = req.query.password;
    const includeResponses = Boolean(password);
    
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
    
    // 관리자 권한 검증 (개별 응답 조회 시)
    let responses;
    if (includeResponses) {
      const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
      
      if (!passwordMatch) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin password'
        });
      }
      
      // 개별 응답 조회
      responses = await db.collection('surveyResponses').find({ surveyId: objectId }).toArray();
    }
    
    // 응답 통계 계산
    const allResponses = await db.collection('surveyResponses').find({ surveyId: objectId }).toArray();
    const totalResponses = allResponses.length;
    
    // 질문별 통계
    const questionStats = survey.questions.map(question => {
      const allAnswers = allResponses
        .map(r => r.answers.find(a => a.questionId === question.id)?.value)
        .filter(Boolean);
      
      let answerDistribution = {};
      
      if (question.type === 'multipleChoice' && question.options) {
        // 선택지별 카운트
        question.options.forEach(option => {
          answerDistribution[option] = allAnswers.filter(a => a === option).length;
        });
      } else if (question.type === 'scale') {
        // 척도 평균
        const numericAnswers = allAnswers.map(a => Number(a)).filter(n => !isNaN(n));
        const sum = numericAnswers.reduce((acc, val) => acc + val, 0);
        answerDistribution = {
          average: numericAnswers.length > 0 ? sum / numericAnswers.length : 0,
          counts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({
            value: n,
            count: numericAnswers.filter(a => a === n).length
          }))
        };
      } else {
        // 텍스트 응답의 경우 단순 리스트
        answerDistribution = allAnswers;
      }
      
      return {
        questionId: question.id,
        questionText: question.text,
        answerDistribution
      };
    });
    
    // AI 분석 결과 (추후 구현)
    const aiSummary = totalResponses > 0 
      ? '이 AI 요약은 실제 Gemini API 통합 시 제공될 예정입니다.'
      : undefined;
    
    // 비밀번호 필드 제외
    const { creationPassword, ...surveyData } = survey;
    
    return res.status(200).json({
      success: true,
      data: {
        survey: surveyData,
        responses,
        analytics: {
          totalResponses,
          questionStats,
          aiSummary
        }
      }
    });
  } catch (error) {
    console.error(`Error getting results for survey ${surveyId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get survey results',
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
      case 'GET':
        return await getSurveyResults(req, res, surveyId);
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