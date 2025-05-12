const dotenv = require('../node_modules/dotenv');
dotenv.config();
const mongoose = require('../node_modules/mongoose');

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/un-thanks-project';

async function testMongoConnection() {
  try {
    console.log('MongoDB 연결 테스트 시작...');
    console.log(`연결 URI: ${MONGODB_URI}`);
    
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');
    
    // 연결 상태 출력
    const state = mongoose.connection.readyState;
    console.log(`MongoDB 연결 상태: ${getReadyStateText(state)}`);
    
    // 데이터베이스 정보 출력
    const db = mongoose.connection.db;
    console.log(`데이터베이스 이름: ${db.databaseName}`);
    
    // 컬렉션 목록 출력
    const collections = await db.listCollections().toArray();
    console.log('데이터베이스 컬렉션 목록:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // 정상 종료
    console.log('MongoDB 연결 테스트 완료. 연결을 종료합니다...');
    await mongoose.connection.close();
    console.log('연결이 안전하게 종료되었습니다.');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB 연결 테스트 실패:', error);
    return false;
  }
}

// 연결 상태 문자열로 변환
function getReadyStateText(state) {
  switch (state) {
    case 0: return '연결되지 않음 (disconnected)';
    case 1: return '연결됨 (connected)';
    case 2: return '연결 중 (connecting)';
    case 3: return '연결 끊는 중 (disconnecting)';
    default: return '알 수 없는 상태';
  }
}

// 테스트 실행
testMongoConnection().then(success => {
  process.exit(success ? 0 : 1);
});