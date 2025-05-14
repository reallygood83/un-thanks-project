// 초기 설문 데이터 생성 스크립트
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
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
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('1234', 10);
    
    // 초기 설문 데이터
    const initialSurveys = [
      {
        title: "6.25 전쟁 감사 프로젝트 만족도 조사",
        description: "UN 참전국 감사 프로젝트에 대한 여러분의 의견을 들려주세요.",
        questions: [
          {
            id: uuidv4(),
            text: "이 프로젝트가 한국전쟁의 역사를 이해하는데 도움이 되었나요?",
            type: "multipleChoice",
            options: ["매우 도움됨", "도움됨", "보통", "도움되지 않음", "전혀 도움되지 않음"],
            required: true
          },
          {
            id: uuidv4(),
            text: "감사편지 작성 기능에 만족하시나요?",
            type: "rating",
            max: 5,
            required: true
          },
          {
            id: uuidv4(),
            text: "개선했으면 하는 점이 있다면 알려주세요.",
            type: "text",
            required: false
          }
        ],
        isActive: true,
        creationPassword: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "통일 교육 효과성 조사",
        description: "통일 교육에 대한 학생들의 인식을 조사합니다.",
        questions: [
          {
            id: uuidv4(),
            text: "통일의 필요성에 대해 어떻게 생각하시나요?",
            type: "multipleChoice",
            options: ["매우 필요함", "필요함", "잘 모르겠음", "필요하지 않음", "전혀 필요하지 않음"],
            required: true
          },
          {
            id: uuidv4(),
            text: "다음 중 관심있는 통일 관련 주제를 모두 선택해주세요.",
            type: "checkbox",
            options: ["북한 문화", "통일 후 경제", "분단의 역사", "평화 프로세스", "국제 관계"],
            required: true
          }
        ],
        isActive: true,
        creationPassword: hashedPassword,
        createdAt: new Date(Date.now() - 86400000), // 하루 전
        updatedAt: new Date(Date.now() - 86400000)
      }
    ];
    
    // 기존 설문 확인
    const existingSurveys = await collection.find({}).toArray();
    
    if (existingSurveys.length === 0) {
      // 설문이 없으면 초기 데이터 삽입
      const result = await collection.insertMany(initialSurveys);
      
      res.status(200).json({
        success: true,
        message: "초기 설문 데이터가 생성되었습니다.",
        created: result.insertedCount,
        surveys: initialSurveys.map(s => ({
          title: s.title,
          description: s.description,
          createdAt: s.createdAt
        }))
      });
    } else {
      res.status(200).json({
        success: true,
        message: "이미 설문이 존재합니다.",
        existing: existingSurveys.length,
        surveys: existingSurveys.map(s => ({
          _id: s._id,
          title: s.title,
          description: s.description,
          createdAt: s.createdAt
        }))
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};