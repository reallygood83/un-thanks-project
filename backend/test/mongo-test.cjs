// MongoDB 연결 테스트 스크립트
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// .env 파일 직접 파싱
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .reduce((acc, line) => {
          const [key, value] = line.split('=').map(part => part.trim());
          if (key && value) acc[key] = value;
          return acc;
        }, {});
      
      Object.assign(process.env, envVars);
    } else {
      console.log('.env 파일을 찾을 수 없습니다. 기본 값을 사용합니다.');
    }
  } catch (error) {
    console.error('.env 파일 로드 중 오류:', error);
  }
}

// .env 파일 로드
loadEnv();

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/un-thanks-project';

async function testMongoConnection() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('MongoDB 연결 테스트 시작...');
    console.log(`연결 URI: ${MONGODB_URI}`);
    
    // MongoDB 연결
    await client.connect();
    console.log('✅ MongoDB 연결 성공!');
    
    // 데이터베이스 선택
    const db = client.db();
    console.log(`데이터베이스 이름: ${db.databaseName}`);
    
    // 컬렉션 목록 출력
    const collections = await db.listCollections().toArray();
    console.log('데이터베이스 컬렉션 목록:');
    if (collections.length === 0) {
      console.log('- 컬렉션이 없습니다. 아직 데이터가 생성되지 않았습니다.');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // 정상 종료
    console.log('MongoDB 연결 테스트 완료. 연결을 종료합니다...');
    await client.close();
    console.log('연결이 안전하게 종료되었습니다.');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB 연결 테스트 실패:', error);
    if (client) {
      await client.close();
    }
    return false;
  }
}

// 테스트 실행
testMongoConnection().then(success => {
  process.exit(success ? 0 : 1);
});