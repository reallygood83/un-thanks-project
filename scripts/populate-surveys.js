const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = process.env.MONGODB_URI;

// 샘플 설문 데이터
const sampleSurveys = [
  {
    title: "2024년 미래로 AI 사용자 만족도 조사",
    description: "미래로 AI 서비스 개선을 위한 사용자 만족도 조사입니다.",
    questions: [
      {
        id: uuidv4(),
        type: "rating",
        question: "미래로 AI의 전반적인 만족도는 어떠신가요?",
        required: true,
        options: "1-5"
      },
      {
        id: uuidv4(),
        type: "multiple",
        question: "가장 유용하게 사용하는 기능은 무엇인가요?",
        required: true,
        options: ["번역", "검색", "분석", "요약", "기타"]
      },
      {
        id: uuidv4(),
        type: "text",
        question: "미래로 AI에 추가되었으면 하는 기능이 있다면?",
        required: false
      }
    ],
    isActive: true,
    creationPassword: "admin123",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "직원 업무 효율성 평가",
    description: "분기별 직원 업무 효율성 평가를 위한 설문조사",
    questions: [
      {
        id: uuidv4(),
        type: "single",
        question: "현재 업무량에 대해 어떻게 생각하시나요?",
        required: true,
        options: ["매우 적음", "적음", "적절함", "많음", "매우 많음"]
      },
      {
        id: uuidv4(),
        type: "rating",
        question: "팀 협업 만족도를 평가해주세요",
        required: true,
        options: "1-10"
      },
      {
        id: uuidv4(),
        type: "text",
        question: "업무 효율성 향상을 위한 제안사항",
        required: false
      }
    ],
    isActive: true,
    creationPassword: "survey456", 
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "신제품 출시 전 사용자 의견 조사",
    description: "새로운 제품 출시 전 타겟 고객층의 의견을 수렴합니다",
    questions: [
      {
        id: uuidv4(),
        type: "single",
        question: "신제품의 예상 가격대는 적절하다고 생각하시나요?",
        required: true,
        options: ["매우 저렴", "저렴", "적절", "비쌈", "매우 비쌈"]
      },
      {
        id: uuidv4(),
        type: "multiple",
        question: "가장 관심있는 제품 기능은? (복수 선택)",
        required: true,
        options: ["디자인", "성능", "가격", "AS", "브랜드"]
      },
      {
        id: uuidv4(),
        type: "text", 
        question: "제품에 대한 추가 의견",
        required: false
      }
    ],
    isActive: false,
    creationPassword: "product789",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function populateSurveys() {
  let client;
  
  try {
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const db = client.db(process.env.MONGODB_DB_NAME || 'unthanks-db');
    const collection = db.collection('surveys');
    
    // 기존 데이터 확인
    const existingCount = await collection.countDocuments();
    console.log(`기존 설문 개수: ${existingCount}`);
    
    // 각 설문에 대해 비밀번호 해싱 후 삽입
    for (const survey of sampleSurveys) {
      const hashedPassword = await bcrypt.hash(survey.creationPassword, 10);
      const surveyToInsert = {
        ...survey,
        creationPassword: hashedPassword
      };
      
      const result = await collection.insertOne(surveyToInsert);
      console.log(`설문 삽입 완료: ${survey.title} (ID: ${result.insertedId})`);
    }
    
    // 최종 개수 확인
    const finalCount = await collection.countDocuments();
    console.log(`최종 설문 개수: ${finalCount}`);
    console.log('설문 데이터 초기화 완료!');
    
  } catch (error) {
    console.error('설문 데이터 초기화 중 오류 발생:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// 스크립트 실행
populateSurveys();