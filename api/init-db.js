// MongoDB 초기화 - 초기 국가 데이터 추가
const { MongoClient } = require('mongodb');

// MongoDB URI와 DB 이름 설정
// 보안 주의: 프로덕션 환경에서는 환경 변수로 저장하고 코드에 직접 넣지 않아야 함
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://unthanks:thanksun@unthanks.mongodb.net/unthanks?retryWrites=true&w=majority';
const MONGODB_DB = process.env.MONGODB_DB || 'unthanks';

// UN 참전국 데이터 - 전투병 파병국, 의료 지원국, 물자 지원국
const participatingCountries = [
  {
    _id: 'usa',
    name: '미국 (United States)',
    nameKo: '미국',
    nameEn: 'United States',
    code: 'usa',
    flagCode: 'us',
    participationType: 'combat',
    region: 'North America',
    language: 'en'
  },
  {
    _id: 'uk',
    name: '영국 (United Kingdom)',
    nameKo: '영국',
    nameEn: 'United Kingdom',
    code: 'uk',
    flagCode: 'gb',
    participationType: 'combat',
    region: 'Europe',
    language: 'en'
  },
  {
    _id: 'turkey',
    name: '터키 (Turkey)',
    nameKo: '터키',
    nameEn: 'Turkey',
    code: 'turkey',
    flagCode: 'tr',
    participationType: 'combat',
    region: 'Middle East',
    language: 'tr'
  },
  {
    _id: 'canada',
    name: '캐나다 (Canada)',
    nameKo: '캐나다',
    nameEn: 'Canada',
    code: 'canada',
    flagCode: 'ca',
    participationType: 'combat',
    region: 'North America',
    language: 'en'
  },
  {
    _id: 'australia',
    name: '호주 (Australia)',
    nameKo: '호주',
    nameEn: 'Australia',
    code: 'australia',
    flagCode: 'au',
    participationType: 'combat',
    region: 'Oceania',
    language: 'en'
  },
  {
    _id: 'france',
    name: '프랑스 (France)',
    nameKo: '프랑스',
    nameEn: 'France',
    code: 'france',
    flagCode: 'fr',
    participationType: 'combat',
    region: 'Europe',
    language: 'fr'
  },
  {
    _id: 'netherlands',
    name: '네덜란드 (Netherlands)',
    nameKo: '네덜란드',
    nameEn: 'Netherlands',
    code: 'netherlands',
    flagCode: 'nl',
    participationType: 'combat',
    region: 'Europe',
    language: 'nl'
  },
  {
    _id: 'philippines',
    name: '필리핀 (Philippines)',
    nameKo: '필리핀',
    nameEn: 'Philippines',
    code: 'philippines',
    flagCode: 'ph',
    participationType: 'combat',
    region: 'Asia',
    language: 'tl'
  },
  {
    _id: 'thailand',
    name: '태국 (Thailand)',
    nameKo: '태국',
    nameEn: 'Thailand',
    code: 'thailand',
    flagCode: 'th',
    participationType: 'combat',
    region: 'Asia',
    language: 'th'
  },
  {
    _id: 'colombia',
    name: '콜롬비아 (Colombia)',
    nameKo: '콜롬비아',
    nameEn: 'Colombia',
    code: 'colombia',
    flagCode: 'co',
    participationType: 'combat',
    region: 'South America',
    language: 'es'
  },
  {
    _id: 'ethiopia',
    name: '에티오피아 (Ethiopia)',
    nameKo: '에티오피아',
    nameEn: 'Ethiopia',
    code: 'ethiopia',
    flagCode: 'et',
    participationType: 'combat',
    region: 'Africa',
    language: 'am'
  },
  {
    _id: 'greece',
    name: '그리스 (Greece)',
    nameKo: '그리스',
    nameEn: 'Greece',
    code: 'greece',
    flagCode: 'gr',
    participationType: 'combat',
    region: 'Europe',
    language: 'el'
  },
  {
    _id: 'belgium',
    name: '벨기에 (Belgium)',
    nameKo: '벨기에',
    nameEn: 'Belgium',
    code: 'belgium',
    flagCode: 'be',
    participationType: 'combat',
    region: 'Europe',
    language: 'fr'
  },
  {
    _id: 'italy',
    name: '이탈리아 (Italy)',
    nameKo: '이탈리아',
    nameEn: 'Italy',
    code: 'italy',
    flagCode: 'it',
    participationType: 'medical',
    region: 'Europe',
    language: 'it'
  },
  {
    _id: 'luxembourg',
    name: '룩셈부르크 (Luxembourg)',
    nameKo: '룩셈부르크',
    nameEn: 'Luxembourg',
    code: 'luxembourg',
    flagCode: 'lu',
    participationType: 'combat',
    region: 'Europe',
    language: 'fr'
  },
  {
    _id: 'india',
    name: '인도 (India)',
    nameKo: '인도',
    nameEn: 'India',
    code: 'india',
    flagCode: 'in',
    participationType: 'medical',
    region: 'Asia',
    language: 'hi'
  },
  {
    _id: 'sweden',
    name: '스웨덴 (Sweden)',
    nameKo: '스웨덴',
    nameEn: 'Sweden',
    code: 'sweden',
    flagCode: 'se',
    participationType: 'medical',
    region: 'Europe',
    language: 'sv'
  },
  {
    _id: 'germany',
    name: '독일 (Germany)',
    nameKo: '독일',
    nameEn: 'Germany',
    code: 'germany',
    flagCode: 'de',
    participationType: 'medical',
    region: 'Europe',
    language: 'de'
  }
];

// 샘플 편지 데이터
const sampleLetters = [
  {
    _id: 'letter-1',
    name: '홍길동',
    school: '서울초등학교',
    grade: '5학년',
    letterContent: '미국 참전용사 여러분, 한국전쟁에서 자유를 위해 싸워주셔서 진심으로 감사드립니다. 여러분의 용기와 희생이 오늘날 대한민국의 번영을 가능하게 했습니다.',
    translatedContent: 'Dear American veterans, thank you sincerely for fighting for freedom in the Korean War. Your courage and sacrifice made the prosperity of today\'s Republic of Korea possible.',
    countryId: 'usa',
    createdAt: new Date('2023-06-25')
  },
  {
    _id: 'letter-2',
    name: '김철수',
    school: '부산중학교',
    grade: '2학년',
    letterContent: '영국 참전용사분들께, 6.25 전쟁에 참전해주셔서 깊은 감사의 마음을 전합니다. 여러분의 희생 덕분에 우리나라가 자유민주주의 국가로 발전할 수 있었습니다.',
    translatedContent: 'To the British veterans, I extend my deep gratitude for your participation in the Korean War. Thanks to your sacrifice, our country was able to develop into a free democratic nation.',
    countryId: 'uk',
    createdAt: new Date('2023-06-26')
  },
  {
    _id: 'letter-3',
    name: '박영희',
    school: '대전고등학교',
    grade: '1학년',
    letterContent: '터키 참전용사님들, 한국전쟁 당시 먼 나라에서 오셔서 우리나라를 도와주셔서 정말 감사합니다. 터키와 한국은 영원한 형제국가입니다.',
    translatedContent: 'Turkish veterans, thank you very much for coming from a distant country to help our country during the Korean War. Turkey and Korea are eternal brother nations.',
    countryId: 'turkey',
    createdAt: new Date('2023-06-27')
  }
];

// MongoDB 초기화 함수
async function initDatabase() {
  let client;
  
  try {
    // MongoDB 연결
    console.log('MongoDB 연결 중...');
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    
    await client.connect();
    console.log('MongoDB 연결 성공');
    
    const db = client.db(MONGODB_DB);
    
    // 국가 컬렉션 초기화
    console.log('국가 데이터 초기화 중...');
    const countriesCollection = db.collection('countries');
    
    // 컬렉션 내 기존 문서 개수 확인
    const countryCount = await countriesCollection.countDocuments();
    
    if (countryCount === 0) {
      // 컬렉션이 비어있으면 데이터 삽입
      const result = await countriesCollection.insertMany(participatingCountries);
      console.log(`${result.insertedCount}개 국가 데이터 추가 완료`);
    } else {
      console.log(`이미 ${countryCount}개의 국가 데이터가 존재합니다. 건너뜁니다.`);
    }
    
    // 편지 컬렉션 초기화
    console.log('편지 데이터 초기화 중...');
    const lettersCollection = db.collection('letters');
    
    // 컬렉션 내 기존 문서 개수 확인
    const letterCount = await lettersCollection.countDocuments();
    
    if (letterCount === 0) {
      // 컬렉션이 비어있으면 데이터 삽입
      const result = await lettersCollection.insertMany(sampleLetters);
      console.log(`${result.insertedCount}개 샘플 편지 데이터 추가 완료`);
    } else {
      console.log(`이미 ${letterCount}개의 편지 데이터가 존재합니다. 건너뜁니다.`);
    }
    
    // 인덱스 생성
    console.log('인덱스 생성 중...');
    await countriesCollection.createIndex({ code: 1 });
    await countriesCollection.createIndex({ region: 1 });
    await countriesCollection.createIndex({ participationType: 1 });
    
    await lettersCollection.createIndex({ countryId: 1 });
    await lettersCollection.createIndex({ createdAt: -1 });
    
    console.log('데이터베이스 초기화 완료!');
    
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
  } finally {
    // 연결 종료
    if (client) {
      await client.close();
      console.log('MongoDB 연결 종료');
    }
  }
}

// 스크립트를 직접 실행하는 경우에만 초기화 실행
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('치명적 오류:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };