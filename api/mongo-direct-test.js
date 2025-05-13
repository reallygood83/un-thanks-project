// MongoDB 직접 연결 테스트 스크립트
// 사용법: node mongo-direct-test.js

const { 
  connectMongo, 
  addLetterToMongo, 
  getLettersFromMongo,
  getLetterFromMongo 
} = require('./mongo-direct');

// 환경변수 설정 (실제 값은 보안을 위해 별도 관리)
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://unthanks:unthanks2025@cluster0.mongodb.net/unthanks-db?retryWrites=true&w=majority';
process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';

// 샘플 편지 데이터
const sampleLetter = {
  name: '테스트사용자',
  school: '테스트학교',
  grade: '3학년',
  letterContent: '한국의 자유를 위해 도와주셔서 감사합니다. 통일교육주간에 편지를 씁니다.',
  countryId: 'test-country'
};

// MongoDB 연결 테스트
async function testMongoConnection() {
  console.log('\n===== MongoDB 연결 테스트 =====');
  try {
    const connection = await connectMongo();
    console.log('MongoDB 연결 성공!');
    await connection.client.close();
    console.log('MongoDB 연결 종료');
    return true;
  } catch (error) {
    console.error('MongoDB 연결 테스트 실패:', error);
    return false;
  }
}

// 편지 저장 테스트
async function testAddLetter() {
  console.log('\n===== 편지 저장 테스트 =====');
  try {
    const result = await addLetterToMongo(sampleLetter);
    console.log('편지 저장 결과:', result);
    
    if (result.success) {
      console.log('✅ 편지 저장 테스트 성공');
      return result.data.id; // 저장된 편지 ID 반환
    } else {
      console.log('❌ 편지 저장 테스트 실패');
      return null;
    }
  } catch (error) {
    console.error('편지 저장 테스트 오류:', error);
    return null;
  }
}

// 편지 목록 조회 테스트
async function testGetLetters() {
  console.log('\n===== 편지 목록 조회 테스트 =====');
  try {
    // 전체 편지 목록 조회
    console.log('1. 전체 편지 목록 조회');
    const result1 = await getLettersFromMongo();
    
    if (result1.success) {
      console.log(`✅ 전체 편지 ${result1.data.length}개 조회 성공`);
      console.log(`총 ${result1.total}개, 현재 페이지: ${result1.page}, 총 페이지: ${result1.pages}`);
      if (result1.data.length > 0) {
        console.log('첫 번째 편지:', result1.data[0]);
      }
    } else {
      console.log('❌ 전체 편지 목록 조회 실패:', result1.error);
    }
    
    // 특정 국가 편지 목록 조회
    console.log('\n2. 특정 국가 편지 목록 조회');
    const result2 = await getLettersFromMongo({ countryId: 'test-country' });
    
    if (result2.success) {
      console.log(`✅ 테스트 국가 편지 ${result2.data.length}개 조회 성공`);
      console.log(`총 ${result2.total}개, 현재 페이지: ${result2.page}, 총 페이지: ${result2.pages}`);
    } else {
      console.log('❌ 특정 국가 편지 목록 조회 실패:', result2.error);
    }
    
    return result1.success && result2.success;
  } catch (error) {
    console.error('편지 목록 조회 테스트 오류:', error);
    return false;
  }
}

// 특정 ID 편지 조회 테스트
async function testGetLetter(id) {
  console.log('\n===== 특정 ID 편지 조회 테스트 =====');
  
  if (!id) {
    console.log('⚠️ 편지 ID가 제공되지 않아 테스트를 건너뜁니다');
    return false;
  }
  
  try {
    console.log(`편지 ID '${id}' 조회`);
    const result = await getLetterFromMongo(id);
    
    if (result.success) {
      console.log('✅ 편지 조회 성공:', result.data);
      return true;
    } else {
      console.log('❌ 편지 조회 실패:', result.error);
      return false;
    }
  } catch (error) {
    console.error('편지 조회 테스트 오류:', error);
    return false;
  }
}

// 잘못된 ID 편지 조회 테스트
async function testGetInvalidLetter() {
  console.log('\n===== 잘못된 ID 편지 조회 테스트 =====');
  
  // 잘못된 형식의 ID
  const invalidId = 'not-a-valid-id';
  
  try {
    console.log(`잘못된 형식의 ID '${invalidId}' 조회`);
    const result = await getLetterFromMongo(invalidId);
    
    if (!result.success && result.error.includes('유효하지 않은 ID')) {
      console.log('✅ 예상대로 오류 발생:', result.error);
      return true;
    } else {
      console.log('❌ 예상치 못한 결과:', result);
      return false;
    }
  } catch (error) {
    console.error('잘못된 ID 테스트 오류:', error);
    return false;
  }
}

// 메인 테스트 함수
async function runTests() {
  console.log('===== MongoDB 직접 연결 테스트 시작 =====');
  
  // 연결 테스트
  const connectionSuccess = await testMongoConnection();
  if (!connectionSuccess) {
    console.log('❌ MongoDB 연결에 실패하여 테스트를 중단합니다');
    return;
  }
  
  // 편지 저장 테스트
  const newLetterId = await testAddLetter();
  
  // 편지 목록 조회 테스트
  await testGetLetters();
  
  // 특정 ID 편지 조회 테스트
  if (newLetterId) {
    await testGetLetter(newLetterId);
  }
  
  // 잘못된 ID 편지 조회 테스트
  await testGetInvalidLetter();
  
  console.log('\n===== MongoDB 직접 연결 테스트 완료 =====');
}

// 테스트 실행
runTests().catch(error => {
  console.error('테스트 실행 중 오류 발생:', error);
});