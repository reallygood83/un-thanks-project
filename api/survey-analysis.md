# 설문 시스템 분석 및 개선 방안

## 현재 상황
- 설문을 편지 API (`submitLetter`)를 통해 생성하고 있음
- type: 'survey' 필드로 구분하여 별도 컬렉션에 저장
- 클라이언트에서 편지 필드(name, letterContent, countryId)를 포함해야 함

## 문제점
1. **데이터 구조 혼재**
   - 편지와 설문이 같은 API 사용
   - 불필요한 필드 전달 필요
   - 데이터 타입 구분이 모호

2. **API 설계 문제**
   - RESTful하지 않은 경로 구조
   - `/api/submitLetter`가 두 가지 역할 수행
   - 새로운 API 경로가 405 에러 발생

3. **확장성 제한**
   - 설문 응답, 통계 기능 추가 시 복잡성 증가
   - 권한 관리가 어려움

## 즉각적 해결 방안

### 1. 현재 구조 유지하면서 개선
```javascript
// submitLetter.js 내부에서 타입별 라우팅
if (type === 'survey') {
  // 별도 핸들러로 분리
  return handleSurveyCreation(req, res);
} else {
  return handleLetterSubmission(req, res);
}
```

### 2. 설문 전용 파라미터 사용
```javascript
// 설문 생성 시 불필요한 편지 필드 제거
const surveyData = {
  type: 'survey',
  title: '설문 제목',
  description: '설문 설명',
  questions: [...],
  // 편지 필드 없이도 동작하도록 수정
};
```

## 장기적 해결 방안

### 1. API 분리 (권장)
- `/api/letters/*` - 편지 관련 API
- `/api/surveys/*` - 설문 관련 API
- 각 도메인별 독립적인 라우터 구성

### 2. Vercel 라우팅 수정
```json
{
  "rewrites": [
    { "source": "/api/surveys/(.*)", "destination": "/api/survey-handler" },
    { "source": "/api/letters/(.*)", "destination": "/api/letter-handler" }
  ]
}
```

### 3. 데이터베이스 구조 개선
```javascript
// surveys 컬렉션
{
  _id: ObjectId,
  title: String,
  description: String,
  questions: Array,
  isActive: Boolean,
  responses: Array,    // 응답 임베디드
  statistics: Object,  // 통계 정보
  createdAt: Date,
  updatedAt: Date
}

// letters 컬렉션
{
  _id: ObjectId,
  name: String,
  school: String,
  letterContent: String,
  countryId: String,
  approved: Boolean,   // 승인 상태
  createdAt: Date
}
```

## 마이그레이션 계획

### 1단계: 현재 구조에서 분리 준비
1. submitLetter.js 내부에서 핸들러 분리
2. 타입별 검증 로직 개선
3. 클라이언트 코드 점진적 업데이트

### 2단계: 새로운 API 경로 생성
1. /api/survey-create 생성 및 테스트
2. Vercel 환경변수로 기능 플래그 관리
3. 클라이언트에서 조건부 경로 사용

### 3단계: 완전한 분리
1. 레거시 코드 제거
2. 문서화 업데이트
3. 모니터링 및 로그 분석

## 결론
현재 접근법은 당장 서비스하는 데 문제없지만, 장기적으로는 명확한 API 분리가 필요합니다. 점진적인 마이그레이션을 통해 안정적으로 전환할 수 있습니다.