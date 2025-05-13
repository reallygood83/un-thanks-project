// MongoDB 데이터 시드 테스트 스크립트
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

// 샘플 국가 데이터
const sampleCountry = {
  name: '테스트 국가 (Test Country)',
  code: 'test',
  participationType: 'combat',
  region: 'Test Region',
  flag: '/flags/test.png',
  language: 'en',
  description: '테스트 국가 설명입니다.',
  statistics: {
    soldiers: 1000,
    casualties: 100,
    startDate: new Date('1950-07-01'),
    endDate: new Date('1953-07-27')
  },
  history: '테스트 국가의 역사 설명입니다.',
  relations: '테스트 국가와 한국의 관계 설명입니다.'
};

// 참전국 데이터 - 몇 개의 실제 데이터 추가
const countriesData = [
  {
    name: '미국 (United States)',
    code: 'usa',
    participationType: 'combat',
    region: 'North America',
    flag: '/flags/usa.png',
    language: 'en',
    description: '미국은 한국전쟁에서 가장 많은 병력을 파견한 국가로, UN군의 중추적 역할을 담당했습니다.',
    statistics: {
      soldiers: 1789000,
      casualties: 36574,
      startDate: new Date('1950-07-01'),
      endDate: new Date('1953-07-27')
    },
    history: '미국은 한국전쟁 발발 직후 UN 안보리 결의안에 따라 한국에 지상군을 파견했으며, 더글라스 맥아더 장군이 UN군 사령관을 맡았습니다.',
    relations: '한미동맹은 한국전쟁을 통해 형성되었으며, 이후 한국의 경제 발전과 안보에 중요한 역할을 했습니다.'
  },
  {
    name: '영국 (United Kingdom)',
    code: 'uk',
    participationType: 'combat',
    region: 'Europe',
    flag: '/flags/uk.png',
    language: 'en',
    description: '영국은 미국에 이어 두 번째로 많은 병력을 파견한 유럽 국가입니다.',
    statistics: {
      soldiers: 56000,
      casualties: 1078,
      startDate: new Date('1950-08-29'),
      endDate: new Date('1953-07-27')
    },
    history: '영국은 1950년 8월 29일 영연방 제27여단을 한국에 파견했습니다. 영국군은 임진강 전투와 같은 주요 전투에 참전했습니다.',
    relations: '한국과 영국은 전쟁 이후 꾸준히 외교, 경제, 문화 교류를 발전시켜왔습니다.'
  },
  {
    name: '터키 (Turkey)',
    code: 'turkey',
    participationType: 'combat',
    region: 'Middle East',
    flag: '/flags/turkey.png',
    language: 'tr',
    description: '터키는 미국 다음으로 많은 병력을 파견한 국가로, 군인들의 용맹함으로 유명합니다.',
    statistics: {
      soldiers: 21212,
      casualties: 741,
      startDate: new Date('1950-10-17'),
      endDate: new Date('1953-07-27')
    },
    history: '터키는 1950년 10월 19일 제1여단을 한국에 파견했습니다. 특히 금성지구 전투와 네바다 전초기지 전투에서 터키군의 용맹함이 돋보였습니다.',
    relations: '한국과 터키는 "피로 맺어진 형제국"이라 불리며, 양국은 전쟁 이후 군사, 경제, 문화 등 다양한 분야에서 협력 관계를 유지하고 있습니다.'
  }
];

async function testSeedData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('MongoDB 데이터 시드 테스트 시작...');
    console.log(`연결 URI: ${MONGODB_URI}`);
    
    // MongoDB 연결
    await client.connect();
    console.log('✅ MongoDB 연결 성공!');
    
    // 데이터베이스 선택
    const db = client.db();
    console.log(`데이터베이스 이름: ${db.databaseName}`);
    
    // Countries 컬렉션 접근
    const countriesCollection = db.collection('countries');
    
    // 기존 데이터 확인
    const existingCount = await countriesCollection.countDocuments();
    console.log(`기존 countries 컬렉션 문서 수: ${existingCount}`);
    
    // 샘플 데이터 삽입
    if (existingCount === 0) {
      console.log('countries 컬렉션에 샘플 데이터 삽입 중...');
      
      // 여러 국가 데이터 삽입
      const result = await countriesCollection.insertMany(countriesData);
      console.log(`✅ ${result.insertedCount}개의 국가 데이터가 성공적으로 삽입되었습니다.`);
      
      // 테스트 국가 추가 (upsert 방식)
      const testCountryResult = await countriesCollection.updateOne(
        { code: sampleCountry.code },
        { $set: sampleCountry },
        { upsert: true }
      );
      
      if (testCountryResult.upsertedCount > 0) {
        console.log(`✅ 테스트 국가 데이터가 성공적으로 삽입되었습니다.`);
      } else if (testCountryResult.modifiedCount > 0) {
        console.log(`✅ 테스트 국가 데이터가 성공적으로 업데이트되었습니다.`);
      } else {
        console.log('테스트 국가 데이터 변경 사항 없음');
      }
    } else {
      console.log('countries 컬렉션에 이미 데이터가 존재합니다. 데이터 삽입을 건너뜁니다.');
    }
    
    // 삽입된 모든 국가 목록 조회
    const countries = await countriesCollection.find({}).toArray();
    console.log(`총 국가 수: ${countries.length}`);
    console.log('국가 목록:');
    countries.forEach(country => {
      console.log(`- ${country.name} (${country.code})`);
    });
    
    // Letters 컬렉션 테스트
    // 테스트 편지 데이터
    if (countries.length > 0) {
      const lettersCollection = db.collection('letters');
      const letterCount = await lettersCollection.countDocuments();
      console.log(`기존 letters 컬렉션 문서 수: ${letterCount}`);
      
      if (letterCount === 0) {
        console.log('letters 컬렉션에 샘플 데이터 삽입 중...');
        
        // 각 국가마다 하나씩 테스트 편지 생성
        const letters = [];
        for (let i = 0; i < Math.min(3, countries.length); i++) {
          const country = countries[i];
          letters.push({
            name: `테스트 사용자 ${i+1}`,
            email: `test${i+1}@example.com`,
            school: '테스트 학교',
            grade: '1학년',
            letterContent: `${country.name}에 보내는 감사의 편지입니다. 참전해주셔서 감사합니다.`,
            translatedContent: `This is a thank you letter to ${country.name}. Thank you for your participation.`,
            originalContent: true,
            countryId: country._id.toString(),
            createdAt: new Date()
          });
        }
        
        const letterResult = await lettersCollection.insertMany(letters);
        console.log(`✅ ${letterResult.insertedCount}개의 편지 데이터가 성공적으로 삽입되었습니다.`);
      } else {
        console.log('letters 컬렉션에 이미 데이터가 존재합니다. 데이터 삽입을 건너뜁니다.');
      }
    }
    
    // 정상 종료
    console.log('MongoDB 데이터 시드 테스트 완료. 연결을 종료합니다...');
    await client.close();
    console.log('연결이 안전하게 종료되었습니다.');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB 데이터 시드 테스트 실패:', error);
    if (client) {
      await client.close();
    }
    return false;
  }
}

// 테스트 실행
testSeedData().then(success => {
  process.exit(success ? 0 : 1);
});