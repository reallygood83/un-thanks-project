# 미래로 AI 설문 개발 문서

## 개발 계획

1. **프론트엔드 구조 설정**
   - 페이지 컴포넌트 생성
   - 라우팅 설정
   - UI 컴포넌트 개발

2. **백엔드 API 및 데이터베이스 모델 구현**
   - MongoDB 스키마 정의
   - API 엔드포인트 구현
   - Gemini API 연동

3. **프론트엔드-백엔드 연동**
   - API 호출 구현
   - 상태 관리 설정

4. **테스트 및 통합**
   - 기능 테스트
   - UNICONPage 통합

## 기술 스택

- **프론트엔드**: React, TypeScript
- **백엔드**: Node.js, Express
- **데이터베이스**: MongoDB
- **AI API**: Gemini 2.0-flash

## 구현 진행 상황

### ✅ 완료된 작업

#### 1. 프로젝트 문서화
- CLAUDE.md 파일 생성 및 개발 계획 수립

#### 2. 타입 정의
- `frontend/src/types/survey.ts` - 설문 관련 타입 정의

#### 3. API 클라이언트
- `frontend/src/api/surveyApi.ts` - 백엔드 API 연동 클라이언트

#### 4. 컴포넌트 구현
- `frontend/src/components/surveys/SurveyCard.tsx` - 설문 카드 컴포넌트
- `frontend/src/components/surveys/SurveyCard.css` - 설문 카드 스타일

#### 5. 페이지 구현
- `frontend/src/pages/SurveyListPage.tsx` - 설문 목록 페이지
- `frontend/src/pages/SurveyListPage.css` - 설문 목록 페이지 스타일

### 🔄 진행 중인 작업

#### 1. 프론트엔드 컴포넌트 개발
- 설문 상세 페이지 구현
- 설문 생성 페이지 구현
- 설문 결과 페이지 구현
- 폼 컴포넌트 구현

#### 2. 백엔드 개발
- MongoDB 모델 구현
- API 엔드포인트 개발
- Gemini API 연동

### 📋 남은 작업

#### 1. 프론트엔드
- 설문 참여 프로세스 구현
- 설문 생성 프로세스 구현
- 결과 시각화 구현
- UNICONPage에 썸네일 통합

#### 2. 백엔드
- 설문 응답 처리 및 저장
- 결과 분석 및 통계 생성
- AI 기반 분석 구현

#### 3. 테스트 및 배포
- 통합 테스트
- 사용자 테스트
- 배포 준비

## 폴더 구조

### 프론트엔드
```
frontend/
  ├── src/
  │   ├── pages/
  │   │   ├── UNICONPage.tsx (수정)
  │   │   ├── SurveyListPage.tsx (신규) ✅
  │   │   ├── SurveyDetailPage.tsx (신규)
  │   │   ├── SurveyCreatePage.tsx (신규)
  │   │   └── SurveyResultPage.tsx (신규)
  │   ├── components/
  │   │   ├── surveys/
  │   │   │   ├── SurveyCard.tsx ✅
  │   │   │   ├── QuestionEditor.tsx
  │   │   │   ├── SurveyForm.tsx
  │   │   │   ├── ResultsChart.tsx
  │   │   │   └── AiAnalysisView.tsx
  │   ├── api/
  │   │   └── surveyApi.ts (신규) ✅
  │   ├── types/
  │   │   └── survey.ts (신규) ✅
```

### 백엔드
```
backend/
  ├── src/
  │   ├── models/
  │   │   ├── Survey.ts (신규)
  │   │   └── Response.ts (신규)
  │   ├── routes/
  │   │   └── surveys.ts (신규)
  │   ├── controllers/
  │   │   └── surveyController.ts (신규)
  │   ├── services/
  │   │   ├── surveyService.ts (신규)
  │   │   └── aiService.ts (신규)
```

## MongoDB 스키마

### Survey 모델
```typescript
const SurveySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['text', 'multipleChoice', 'scale'], required: true },
    options: [{ type: String }],
    required: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true },
  creationPassword: { type: String, required: true }, // 해시 처리
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Response 모델
```typescript
const ResponseSchema = new Schema({
  surveyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Survey',
    required: true 
  },
  respondentInfo: {
    name: { type: String },
    age: { type: String },
    region: { type: String }
  },
  answers: [{
    questionId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
  }],
  aiAnalysis: { type: String },
  createdAt: { type: Date, default: Date.now }
});
```

## API 엔드포인트

```
GET    /api/surveys             - 활성화된 모든 설문조사 목록
POST   /api/surveys             - 새 설문조사 생성 (비밀번호 필요)
GET    /api/surveys/:id         - 특정 설문조사 내용 조회
PUT    /api/surveys/:id         - 설문조사 수정 (비밀번호 필요)
DELETE /api/surveys/:id         - 설문조사 삭제 (비밀번호 필요)
POST   /api/surveys/:id/verify  - 관리자 비밀번호 확인
POST   /api/surveys/:id/responses - 설문 응답 제출
GET    /api/surveys/:id/results - 결과 조회 (공개 또는 비밀번호)
POST   /api/surveys/generate    - AI 기반 설문 생성
```

## Gemini API 통합

1. **설문 생성 지원**
   - 통일교육 주제에 맞는 설문 템플릿 자동 생성
   - 연령대별 적합한 용어 및 문장 구조 조정

2. **응답 분석 및 인사이트**
   - 주관식 답변 자연어 이해 및 분류
   - 응답 패턴 분석 및 키워드 추출
   - 자동 요약 보고서 생성

3. **대화형 설문 인터페이스**
   - 이전 답변에 따른 동적 질문 조정
   - 학생 수준에 맞춘 설명 제공

## 구현 단계별 접근법

1. **1단계: 기본 설문 시스템 구축**
   - MongoDB 데이터 모델 구현
   - 기본 CRUD API 개발
   - 설문 생성/참여/결과 UI 구현

2. **2단계: Gemini API 통합**
   - API 클라이언트 구현
   - 설문 생성 AI 조력자 개발
   - 응답 분석 기능 구현

3. **3단계: 고급 기능 개발**
   - 대화형 설문 인터페이스
   - 동적 질문 흐름 구현
   - 고급 결과 시각화 대시보드

4. **4단계: 최적화 및 안정화**
   - 성능 최적화 및 캐싱 구현
   - 오류 처리 및 로깅 강화
   - 사용성 테스트 및 UI/UX 개선

## UNICONPage 수정사항

```tsx
// 기존 "준비중" 카드를 아래와 같이 수정
<Link to="/survey" className="project-card">
  <div className="card-image ai-survey-bg">
    <div className="card-overlay">
      <h3>미래로 AI 설문</h3>
      <p>AI가 분석하는 미래 통일 한국에 대한 설문조사</p>
    </div>
  </div>
  <div className="card-content">
    <h3 className="card-title">미래로 AI 설문</h3>
    <p className="card-description">미래 통일 한국의 모습에 대한 여러분의 생각을 설문으로 남겨주세요. AI가 분석한 결과를 확인할 수 있습니다.</p>
    <div className="card-cta">
      <span className="cta-text">설문 참여하기</span>
      <span className="cta-icon">→</span>
    </div>
  </div>
</Link>
```

## CSS 스타일링 업데이트

```css
/* UNICONPage.css에 추가 */
.ai-survey-bg {
  background-image: url('https://img.freepik.com/free-photo/futuristic-smart-city-with-5g-global-network-technology_53876-98438.jpg');
}
```

## 다음 구현 계획

1. `SurveyDetailPage.tsx` 및 `SurveyForm.tsx` 구현
   - 설문 참여 페이지 UI 개발
   - 응답 제출 로직 구현

2. `SurveyCreatePage.tsx` 및 `QuestionEditor.tsx` 구현
   - 설문 생성 페이지 UI 개발
   - Gemini API 연동 구현

3. `SurveyResultPage.tsx` 및 `ResultsChart.tsx` 구현
   - 결과 시각화 개발
   - 데이터 분석 및 표시

4. 백엔드 API 구현
   - MongoDB 모델 생성
   - 컨트롤러 및 서비스 개발
   - Gemini API 통합