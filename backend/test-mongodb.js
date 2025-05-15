const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

const API_URL = 'http://localhost:5001/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/un-thanks-project';

// 컬러 로그 함수
const logSuccess = (msg) => console.log('\x1b[32m%s\x1b[0m', `✅ ${msg}`);
const logError = (msg) => console.log('\x1b[31m%s\x1b[0m', `❌ ${msg}`);
const logInfo = (msg) => console.log('\x1b[36m%s\x1b[0m', `ℹ️ ${msg}`);
const logWarning = (msg) => console.log('\x1b[33m%s\x1b[0m', `⚠️ ${msg}`);

// MongoDB 직접 연결 테스트
async function testMongoDBConnection() {
  try {
    logInfo('MongoDB 직접 연결 테스트 중...');
    await mongoose.connect(MONGODB_URI);
    logSuccess('MongoDB에 직접 연결되었습니다!');
    
    // 콜렉션 목록 조회
    const collections = await mongoose.connection.db.listCollections().toArray();
    logInfo(`DB 콜렉션 목록: ${collections.map(c => c.name).join(', ')}`);
    
    // 연결 종료
    await mongoose.connection.close();
    logSuccess('MongoDB 연결 테스트 완료');
    return true;
  } catch (error) {
    logError(`MongoDB 연결 오류: ${error.message}`);
    return false;
  }
}

// 서버 API 테스트
async function testApiEndpoints() {
  try {
    logInfo('API 엔드포인트 테스트 중...');
    
    // 1. 서버 상태 확인
    logInfo('서버 상태 확인 중...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    logSuccess(`서버 상태: ${JSON.stringify(healthResponse.data)}`);
    
    // 2. 데이터베이스 상태 확인
    logInfo('데이터베이스 상태 확인 중...');
    const dbStatusResponse = await axios.get(`${API_URL}/database/status`);
    logSuccess(`DB 상태: ${JSON.stringify(dbStatusResponse.data)}`);
    
    // 3. 편지 API 테스트
    logInfo('편지 API 테스트 중...');
    const lettersResponse = await axios.get(`${API_URL}/letters`);
    logSuccess(`편지 목록 조회 성공: ${lettersResponse.data.data.length}개 편지 조회됨`);
    
    // 4. 설문 API 테스트
    logInfo('설문 API 테스트 중...');
    const surveysResponse = await axios.get(`${API_URL}/surveys`);
    logSuccess(`설문 목록 조회 성공: ${surveysResponse.data.data.length}개 설문 조회됨`);
    
    // 5. 편지 생성 테스트
    logInfo('새 편지 생성 테스트 중...');
    const newLetter = {
      name: '테스트 사용자',
      email: 'test@example.com',
      school: '테스트 학교',
      grade: '1학년',
      letterContent: '테스트 편지 내용입니다. MongoDB 연결 테스트.',
      countryId: 'US', // 미국
    };
    
    const createLetterResponse = await axios.post(`${API_URL}/letters`, newLetter);
    logSuccess(`편지 생성 성공: ID ${createLetterResponse.data.data.id}`);
    
    // 생성된 편지 확인
    const letterId = createLetterResponse.data.data.id;
    const getLetterResponse = await axios.get(`${API_URL}/letters/${letterId}`);
    logSuccess(`생성된 편지 조회 성공: ${getLetterResponse.data.data.name}`);
    
    return true;
  } catch (error) {
    logError(`API 테스트 오류: ${error.message}`);
    if (error.response) {
      logError(`상태 코드: ${error.response.status}`);
      logError(`응답 데이터: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// 통합 테스트 실행
async function runTests() {
  logInfo('===== MongoDB 연결 및 API 테스트 시작 =====');
  
  // 1. MongoDB 직접 연결 테스트
  const connectionSuccess = await testMongoDBConnection();
  
  // 2. API 엔드포인트 테스트
  const apiSuccess = await testApiEndpoints();
  
  // 결과 요약
  logInfo('===== 테스트 결과 요약 =====');
  connectionSuccess 
    ? logSuccess('MongoDB 직접 연결: 성공') 
    : logError('MongoDB 직접 연결: 실패');
    
  apiSuccess 
    ? logSuccess('API 엔드포인트 테스트: 성공') 
    : logError('API 엔드포인트 테스트: 실패');
  
  logInfo('===== 테스트 완료 =====');
}

// 테스트 실행
runTests(); 