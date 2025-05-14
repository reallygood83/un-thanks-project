// MongoDB 직접 연결 및 처리 모듈 - 설문 전용
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// MongoDB 연결 정보
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
const SURVEYS_COLLECTION = 'surveys';
const RESPONSES_COLLECTION = 'surveyResponses';

/**
 * MongoDB에 연결
 * @returns {Promise<{db: any, client: MongoClient}>}
 */
async function connectMongo() {
  try {
    console.log('MongoDB 연결 시도 (설문)...');
    
    // MongoDB 클라이언트 생성
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // 데이터베이스 액세스
    const db = client.db(DB_NAME);
    
    console.log('MongoDB 연결 성공 (설문)!');
    return { client, db };
  } catch (err) {
    console.error('MongoDB 연결 오류 (설문):', err);
    throw err;
  }
}

/**
 * 설문 목록 조회
 * @returns {Promise<Object>}
 */
async function getSurveysFromMongo() {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 컬렉션 참조
    const collection = db.collection(SURVEYS_COLLECTION);
    
    // 활성화된 설문만 조회
    const surveys = await collection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`MongoDB에서 ${surveys.length}개 설문 조회됨`);
    
    // 비밀번호 필드 제거
    const safeSurveys = surveys.map(survey => {
      const { creationPassword, ...safeData } = survey;
      return safeData;
    });
    
    // 응답 데이터 생성
    return {
      success: true,
      data: safeSurveys
    };
  } catch (error) {
    console.error('MongoDB 설문 목록 조회 오류:', error);
    return {
      success: false,
      error: error.message || 'MongoDB 설문 목록 조회 중 오류 발생'
    };
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료 (설문)');
    }
  }
}

/**
 * 설문 생성
 * @param {Object} surveyData - 설문 데이터
 * @returns {Promise<Object>}
 */
async function createSurveyInMongo(surveyData) {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 컬렉션 참조
    const collection = db.collection(SURVEYS_COLLECTION);
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(surveyData.creationPassword, 10);
    
    // 질문 ID 할당
    const questionsWithIds = surveyData.questions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    }));
    
    // 저장할 문서 생성
    const survey = {
      title: surveyData.title,
      description: surveyData.description,
      questions: questionsWithIds,
      isActive: surveyData.isActive !== false,
      creationPassword: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // MongoDB에 저장
    const result = await collection.insertOne(survey);
    
    console.log('MongoDB에 설문 저장 성공:', result.insertedId);
    
    // 비밀번호 필드 제거한 응답 데이터
    const { creationPassword, ...responseData } = survey;
    
    return {
      success: true,
      data: {
        _id: result.insertedId,
        ...responseData
      }
    };
  } catch (error) {
    console.error('MongoDB 설문 저장 오류:', error);
    return {
      success: false,
      error: error.message || 'MongoDB 설문 저장 중 오류 발생'
    };
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료 (설문)');
    }
  }
}

/**
 * 특정 ID 설문 조회
 * @param {string} id - 조회할 설문 ID
 * @returns {Promise<Object>}
 */
async function getSurveyFromMongo(id) {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 컬렉션 참조
    const collection = db.collection(SURVEYS_COLLECTION);
    
    // ID 형식 확인 및 변환
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      console.error('유효하지 않은 ObjectId 형식:', id);
      return {
        success: false,
        error: '유효하지 않은 ID 형식입니다'
      };
    }
    
    // ID로 문서 조회
    const survey = await collection.findOne({ _id: objectId });
    
    // 설문을 찾지 못한 경우
    if (!survey) {
      console.log(`ID ${id}에 해당하는 설문을 찾을 수 없습니다`);
      return {
        success: false,
        error: '요청한 ID의 설문을 찾을 수 없습니다'
      };
    }
    
    console.log(`ID ${id} 설문 조회 성공`);
    
    // 비밀번호 필드 제거
    const { creationPassword, ...safeData } = survey;
    
    // 응답 데이터 생성
    return {
      success: true,
      data: safeData
    };
  } catch (error) {
    console.error('MongoDB 설문 조회 오류:', error);
    return {
      success: false,
      error: error.message || 'MongoDB 설문 조회 중 오류 발생'
    };
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료 (설문)');
    }
  }
}

/**
 * 설문 응답 제출
 * @param {string} surveyId - 설문 ID
 * @param {Object} responseData - 응답 데이터
 * @returns {Promise<Object>}
 */
async function submitSurveyResponseToMongo(surveyId, responseData) {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 설문 조회
    let objectId;
    try {
      objectId = new ObjectId(surveyId);
    } catch (error) {
      return {
        success: false,
        error: '유효하지 않은 설문 ID 형식입니다'
      };
    }
    
    const surveysCollection = db.collection(SURVEYS_COLLECTION);
    const survey = await surveysCollection.findOne({ _id: objectId });
    
    if (!survey) {
      return {
        success: false,
        error: '설문을 찾을 수 없습니다'
      };
    }
    
    if (!survey.isActive) {
      return {
        success: false,
        error: '이 설문은 더 이상 응답을 받지 않습니다'
      };
    }
    
    // 응답 컬렉션 참조
    const responsesCollection = db.collection(RESPONSES_COLLECTION);
    
    // 저장할 응답 문서 생성
    const response = {
      surveyId: objectId,
      respondentInfo: responseData.respondentInfo || {},
      answers: responseData.answers,
      createdAt: new Date()
    };
    
    // MongoDB에 저장
    const result = await responsesCollection.insertOne(response);
    
    console.log('MongoDB에 설문 응답 저장 성공:', result.insertedId);
    
    return {
      success: true,
      data: {
        responseId: result.insertedId
      }
    };
  } catch (error) {
    console.error('MongoDB 설문 응답 저장 오류:', error);
    return {
      success: false,
      error: error.message || 'MongoDB 설문 응답 저장 중 오류 발생'
    };
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료 (설문 응답)');
    }
  }
}

/**
 * 특정 ID 설문 조회 (새 API용)
 * @param {string} id - 조회할 설문 ID
 * @returns {Promise<Object>}
 */
async function getSurveyByIdFromMongo(id) {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 컬렉션 참조
    const collection = db.collection(SURVEYS_COLLECTION);
    
    // ID 형식 확인 및 변환
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      throw new Error('유효하지 않은 ID 형식입니다');
    }
    
    // ID로 문서 조회
    const survey = await collection.findOne({ _id: objectId });
    
    if (!survey) {
      throw new Error('설문을 찾을 수 없습니다');
    }
    
    // 비밀번호 필드 제거
    const { creationPassword, ...safeData } = survey;
    
    return safeData;
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
    }
  }
}

/**
 * 설문 응답 제출 (새 API용)
 * @param {string} surveyId - 설문 ID
 * @param {Object} responses - 응답 데이터
 * @returns {Promise<Object>}
 */
async function submitResponseToMongo(surveyId, responses) {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // 설문 조회
    let objectId;
    try {
      objectId = new ObjectId(surveyId);
    } catch (error) {
      throw new Error('유효하지 않은 설문 ID 형식입니다');
    }
    
    const surveysCollection = db.collection(SURVEYS_COLLECTION);
    const survey = await surveysCollection.findOne({ _id: objectId });
    
    if (!survey) {
      throw new Error('설문을 찾을 수 없습니다');
    }
    
    if (!survey.isActive) {
      throw new Error('이 설문은 더 이상 응답을 받지 않습니다');
    }
    
    // 응답 컬렉션 참조
    const responsesCollection = db.collection(RESPONSES_COLLECTION);
    
    // 저장할 응답 문서 생성
    const response = {
      surveyId: objectId,
      responses: responses,
      createdAt: new Date()
    };
    
    // MongoDB에 저장
    const result = await responsesCollection.insertOne(response);
    
    return {
      responseId: result.insertedId,
      message: '응답이 성공적으로 제출되었습니다'
    };
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
    }
  }
}

/**
 * 설문 통계 조회
 * @param {string} surveyId - 설문 ID
 * @returns {Promise<Object>}
 */
async function getSurveyStatsFromMongo(surveyId) {
  let client = null;
  
  try {
    // MongoDB 연결
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;
    
    // ID 형식 확인 및 변환
    let objectId;
    try {
      objectId = new ObjectId(surveyId);
    } catch (error) {
      throw new Error('유효하지 않은 설문 ID 형식입니다');
    }
    
    // 설문 조회
    const surveysCollection = db.collection(SURVEYS_COLLECTION);
    const survey = await surveysCollection.findOne({ _id: objectId });
    
    if (!survey) {
      throw new Error('설문을 찾을 수 없습니다');
    }
    
    // 응답 통계 계산
    const responsesCollection = db.collection(RESPONSES_COLLECTION);
    const responses = await responsesCollection.find({ surveyId: objectId }).toArray();
    
    // 질문별 통계 계산
    const stats = {
      surveyId: surveyId,
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
    
    return stats;
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
    }
  }
}

module.exports = {
  connectMongo,
  getSurveysFromMongo,
  createSurveyInMongo,
  getSurveyFromMongo,
  submitSurveyResponseToMongo,
  getSurveyByIdFromMongo,
  submitResponseToMongo,
  getSurveyStatsFromMongo
};