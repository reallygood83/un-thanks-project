// 테스트 설문 추가용 임시 API
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
    
    // 테스트 설문 데이터
    const testSurvey = {
      title: "통일 교육 프로젝트 피드백",
      description: "UN 참전국 감사 프로젝트에 대한 여러분의 소중한 의견을 들려주세요.",
      questions: [
        {
          id: uuidv4(),
          text: "이 프로젝트가 한국전쟁을 이해하는데 도움이 되었나요?",
          type: "multipleChoice",
          options: ["매우 도움됨", "도움됨", "보통", "별로", "전혀 도움안됨"],
          required: true
        },
        {
          id: uuidv4(),
          text: "프로젝트 만족도를 평가해주세요.",
          type: "rating",
          max: 5,
          required: true
        },
        {
          id: uuidv4(),
          text: "개선사항이나 제안을 자유롭게 작성해주세요.",
          type: "text",
          required: false
        }
      ],
      isActive: true,
      creationPassword: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 설문 추가
    const result = await collection.insertOne(testSurvey);
    
    res.status(200).json({
      success: true,
      message: "테스트 설문이 추가되었습니다.",
      data: {
        _id: result.insertedId,
        title: testSurvey.title,
        description: testSurvey.description,
        createdAt: testSurvey.createdAt
      }
    });
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