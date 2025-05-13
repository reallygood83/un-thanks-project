// 국가 모델 - MongoDB 저장용
const mongoose = require('mongoose');

// 스키마 정의
const countrySchema = new mongoose.Schema(
  {
    // 국가 ID (예: usa, uk, turkey)
    _id: {
      type: String,
      required: true,
      trim: true
    },
    
    // 국가명 (한글+영문)
    name: {
      type: String,
      required: true,
      trim: true
    },
    
    // 국가명 (한글)
    nameKo: {
      type: String,
      required: true,
      trim: true
    },
    
    // 국가명 (영문)
    nameEn: {
      type: String,
      required: true,
      trim: true
    },
    
    // 국가 코드 (예: usa, uk, turkey)
    code: {
      type: String,
      required: true,
      trim: true
    },
    
    // 국기 코드 (예: us, gb, tr) - 국기 이미지 URL 생성용
    flagCode: {
      type: String,
      required: true,
      trim: true
    },
    
    // 참전 유형 (combat: 전투, medical: 의료, supplies: 물자)
    participationType: {
      type: String,
      required: true,
      enum: ['combat', 'medical', 'supplies'],
      default: 'combat'
    },
    
    // 지역 (대륙)
    region: {
      type: String,
      required: false,
      trim: true
    },
    
    // 언어 코드 (예: en, fr, tr)
    language: {
      type: String,
      required: true,
      trim: true,
      default: 'en'
    }
  },
  {
    // 옵션 설정
    timestamps: true,
    collection: 'countries',
    // 가상 필드 JSON 변환 시 포함
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// id 가상 필드 (몽구스 _id를 id로 매핑)
countrySchema.virtual('id').get(function() {
  return this._id;
});

// 인덱스 설정
countrySchema.index({ code: 1 });
countrySchema.index({ region: 1 });
countrySchema.index({ participationType: 1 });

// 모델 생성 - Mongoose 연결이 있을 때만
let Country;
try {
  // 기존 모델이 있으면 재사용, 없으면 새로 생성
  Country = mongoose.models.Country || mongoose.model('Country', countrySchema);
} catch (error) {
  console.error('Mongoose model error:', error);
  // 서버리스 환경에서는 모델 정의만 포함하고 실제 연결은 핸들러에서 수행
}

module.exports = Country;