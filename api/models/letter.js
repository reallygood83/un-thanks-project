// 편지 모델 - MongoDB 저장용
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// 스키마 정의
const letterSchema = new mongoose.Schema(
  {
    // 기본 ID 대신 UUID 사용
    _id: {
      type: String,
      default: () => uuidv4()
    },
    
    // 이름 (필수)
    name: {
      type: String,
      required: true,
      trim: true
    },
    
    // 학교 (선택)
    school: {
      type: String,
      required: false,
      default: '',
      trim: true
    },
    
    // 학년 (선택)
    grade: {
      type: String,
      required: false,
      default: '',
      trim: true
    },
    
    // 편지 내용 (필수)
    letterContent: {
      type: String,
      required: true,
      trim: true
    },
    
    // 번역된 내용
    translatedContent: {
      type: String,
      required: true,
      trim: true
    },
    
    // 대상 국가 ID (필수)
    countryId: {
      type: String,
      required: true,
      trim: true
    },
    
    // 생성 일자
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // 옵션 설정
    timestamps: true,
    collection: 'letters',
    // 가상 필드 JSON 변환 시 포함
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// id 가상 필드 (몽구스 _id를 id로 매핑)
letterSchema.virtual('id').get(function() {
  return this._id;
});

// 인덱스 설정
letterSchema.index({ countryId: 1 });
letterSchema.index({ createdAt: -1 });

// 모델 생성 - Mongoose 연결이 있을 때만
let Letter;
try {
  // 기존 모델이 있으면 재사용, 없으면 새로 생성
  Letter = mongoose.models.Letter || mongoose.model('Letter', letterSchema);
} catch (error) {
  console.error('Mongoose model error:', error);
  // 서버리스 환경에서는 모델 정의만 포함하고 실제 연결은 핸들러에서 수행
}

module.exports = Letter;