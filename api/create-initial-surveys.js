// 초기 설문 데이터 생성 API
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

module.exports = async (req, res) => {
  console.log('create-initial-surveys API 호출');
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  const MONGODB_URI = process.env.MONGODB_URI;
  const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
  
  let client = null;
  
  try {
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(DB_NAME);
    const collection = db.collection('surveys');
    
    // 이미 설문이 있는지 확인
    const existingCount = await collection.countDocuments();
    console.log(`기존 설문 개수: ${existingCount}`);
    
    if (existingCount > 0) {
      return res.status(200).json({
        success: true,
        message: '이미 설문이 존재합니다',
        count: existingCount
      });
    }
    
    // 초기 설문 데이터
    const initialSurveys = [
      {
        title: 'UN 감사 프로젝트 공식 설문조사',
        description: '한국전쟁 UN 참전국에 대한 감사와 인식 조사',
        questions: [
          {
            id: uuidv4(),
            type: 'single',
            question: '한국전쟁에 참전한 UN군에 대해 얼마나 알고 계신가요?',
            required: true,
            options: ['매우 잘 안다', '어느 정도 안다', '조금 안다', '거의 모른다']
          },
          {
            id: uuidv4(),
            type: 'multiple',
            question: '가장 감사하게 생각하는 참전국은? (복수 선택)',
            required: true,
            options: ['미국', '영국', '터키', '캐나다', '호주', '필리핀', '태국', '기타']
          },
          {
            id: uuidv4(),
            type: 'rating',
            question: 'UN 참전국들에 대한 감사의 마음을 평가해주세요',
            required: true,
            options: '1-10'
          },
          {
            id: uuidv4(),
            type: 'text',
            question: '참전국들에게 전하고 싶은 감사의 메시지가 있다면?',
            required: false
          }
        ],
        isActive: true,
        creationPassword: await bcrypt.hash('admin123', 10),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '통일에 대한 의견 조사',
        description: '미래 통일 한국에 대한 의견을 수렴합니다',
        questions: [
          {
            id: uuidv4(),
            type: 'single',
            question: '한반도 통일이 필요하다고 생각하시나요?',
            required: true,
            options: ['매우 필요하다', '필요하다', '필요하지 않다', '전혀 필요하지 않다']
          },
          {
            id: uuidv4(),
            type: 'text',
            question: '통일 한국의 미래는 어떤 모습이어야 한다고 생각하시나요?',
            required: false
          }
        ],
        isActive: true,
        creationPassword: await bcrypt.hash('admin123', 10),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // 설문 삽입
    const result = await collection.insertMany(initialSurveys);
    console.log(`${result.insertedCount}개의 설문 생성됨`);
    
    // 생성된 설문 조회
    const surveys = await collection.find({}).toArray();
    
    // 비밀번호 필드 제거
    const safeSurveys = surveys.map(survey => {
      const { creationPassword, ...safeData } = survey;
      return safeData;
    });
    
    return res.status(200).json({
      success: true,
      message: '초기 설문이 생성되었습니다',
      count: result.insertedCount,
      data: safeSurveys
    });
    
  } catch (error) {
    console.error('초기 설문 생성 중 오류:', error);
    return res.status(500).json({
      success: false,
      error: '설문 생성 중 오류가 발생했습니다',
      message: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};