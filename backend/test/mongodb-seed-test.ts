import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

// 환경 변수 로드
dotenv.config();

// MongoDB 연결 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/un-thanks-project';

// 인터페이스 정의
interface ICountry extends Document {
  name: string;
  code: string;
  participationType: string;
  region: string;
  flag: string;
  language: string;
  description: string;
  statistics: {
    soldiers?: number;
    casualties?: number;
    startDate?: Date;
    endDate?: Date;
  };
  history: string;
  relations: string;
}

interface ILetter extends Document {
  name: string;
  email: string;
  school: string;
  grade: string;
  letterContent: string;
  translatedContent: string;
  originalContent: boolean;
  countryId: string;
  createdAt: Date;
}

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

// 샘플 편지 데이터
const sampleLetter = {
  name: '테스트 사용자',
  email: 'test@example.com',
  school: '테스트 학교',
  grade: '1학년',
  letterContent: '감사의 마음을 전합니다. 테스트 편지입니다.',
  translatedContent: 'Thank you for your service. This is a test letter.',
  originalContent: true,
  countryId: '',  // 실제 테스트에서 채워질 예정
  createdAt: new Date()
};

async function testMongoSeed() {
  try {
    console.log('MongoDB 시드 테스트 시작...');
    
    // MongoDB 연결
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공!');
    
    // 스키마 정의 (테스트용)
    const CountrySchema = new Schema({
      name: { type: String, required: true },
      code: { type: String, required: true, unique: true },
      participationType: { 
        type: String, 
        required: true, 
        enum: ['combat', 'medical', 'material'] 
      },
      region: { type: String, required: true },
      flag: { type: String, default: '' },
      language: { type: String, required: true },
      description: { type: String, default: '' },
      statistics: {
        soldiers: { type: Number },
        casualties: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date }
      },
      history: { type: String, default: '' },
      relations: { type: String, default: '' }
    });
    
    const LetterSchema = new Schema({
      name: { type: String, required: true },
      email: { type: String, required: true },
      school: { type: String, default: '' },
      grade: { type: String, default: '' },
      letterContent: { type: String, required: true },
      translatedContent: { type: String, required: true },
      originalContent: { type: Boolean, default: true },
      countryId: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });
    
    // 모델 생성
    const Country = mongoose.models.Country || mongoose.model<ICountry>('Country', CountrySchema);
    const Letter = mongoose.models.Letter || mongoose.model<ILetter>('Letter', LetterSchema);
    
    // 테스트 국가 추가
    console.log('테스트 국가 데이터 생성 중...');
    const countryResult = await Country.findOneAndUpdate(
      { code: sampleCountry.code },
      sampleCountry,
      { upsert: true, new: true }
    );
    console.log(`테스트 국가 생성됨: ${countryResult.name} (ID: ${countryResult._id})`);
    
    // 테스트 편지 추가
    console.log('테스트 편지 데이터 생성 중...');
    sampleLetter.countryId = countryResult._id.toString();
    const letterResult = await Letter.create(sampleLetter);
    console.log(`테스트 편지 생성됨: ${letterResult._id}`);
    
    // 데이터 확인
    const countries = await Country.find().lean();
    const letters = await Letter.find().lean();
    
    console.log(`총 국가 수: ${countries.length}`);
    console.log(`총 편지 수: ${letters.length}`);
    
    // 정상 종료
    console.log('MongoDB 시드 테스트 완료. 연결을 종료합니다...');
    await mongoose.connection.close();
    console.log('연결이 안전하게 종료되었습니다.');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB 시드 테스트 실패:', error);
    return false;
  }
}

// 테스트 실행
testMongoSeed().then(success => {
  process.exit(success ? 0 : 1);
});