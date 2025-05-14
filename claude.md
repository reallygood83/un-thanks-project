# Claude.md - UN Thanks Project 개발 가이드

## 프로젝트 개요
6.25 한국전쟁 UN 참전국 감사 프로젝트는 한국전쟁 당시 대한민국의 자유와 평화를 위해 도움을 준 67개국에 감사의 마음을 전하는 통일 교육 프로젝트입니다.

## 기술 스택
- **프론트엔드**: React, TypeScript, Vite
- **백엔드**: Node.js, Vercel Serverless Functions
- **데이터베이스**: MongoDB Atlas
- **배포**: Vercel

## 주요 기능

### 1. 편지 기능
- 참전국에 감사의 편지 작성
- 국가별 편지 목록 조회
- MongoDB에 편지 저장

### 2. 설문 기능
- 설문 생성 및 관리
- 설문 응답 수집
- 설문 결과 통계

## API 엔드포인트

### 편지 관련
- `GET /api/getLetters` - 편지 목록 조회
- `POST /api/submitLetter` - 편지 제출

### 설문 관련
- `GET /api/getLetters?type=surveys` - 설문 목록 조회
- `POST /api/getLetters` - 설문 생성 (설문 데이터 전송)
- `POST /api/submitLetter` - 설문/편지 통합 제출

## 데이터베이스 구조

### MongoDB Collections
1. **letters** - 편지 데이터
   ```javascript
   {
     _id: ObjectId,
     name: String,
     school: String,
     grade: String,
     letterContent: String,
     countryId: String,
     createdAt: Date
   }
   ```

2. **surveys** - 설문 데이터
   ```javascript
   {
     _id: ObjectId,
     title: String,
     description: String,
     questions: Array,
     isActive: Boolean,
     creationPassword: String (hashed),
     createdAt: Date,
     updatedAt: Date
   }
   ```

## 개발 환경 설정

### 환경 변수
- `MONGODB_URI`: MongoDB 연결 문자열
- `MONGODB_DB_NAME`: 데이터베이스 이름 (기본: unthanks-db)

### 로컬 개발
```bash
# 프론트엔드 개발 서버
cd frontend
npm install
npm run dev

# 백엔드 (Vercel Functions)
vercel dev
```

### 빌드 및 배포
```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 파일 복사
cp -r frontend/dist/* .

# Git 커밋 및 푸시
git add -A
git commit -m "커밋 메시지"
git push
```

## 주요 문제 해결

### API 인식 문제
- Vercel에서 새로운 API 엔드포인트가 인식되지 않는 경우가 있음
- 해결: 기존 작동하는 API (예: getLetters)를 확장하여 사용

### 설문 생성 문제
- `submitLetter` API의 타입 파라미터가 제대로 처리되지 않는 문제
- 해결: getLetters API에 POST 메서드 추가하여 설문 생성 처리

### CORS 설정
- 모든 API에 CORS 헤더 설정 필요
- Access-Control-Allow-Origin: *
- Access-Control-Allow-Methods: GET, POST, OPTIONS

## 테스트 방법

### 설문 기능 테스트
```javascript
// 브라우저 콘솔에서 실행
const testSurvey = async () => {
  // 설문 생성
  const response = await fetch('/api/getLetters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: '테스트 설문',
      description: '설명',
      questions: [{
        type: 'single',
        question: '질문',
        required: true,
        options: ['옵션1', '옵션2']
      }],
      isActive: true,
      creationPassword: 'test123'
    })
  });
  
  const result = await response.json();
  console.log('설문 생성:', result);
  
  // 설문 목록 조회
  const listResponse = await fetch('/api/getLetters?type=surveys');
  const list = await listResponse.json();
  console.log('설문 목록:', list);
};

testSurvey();
```

## 참고 사항
- MongoDB Atlas 클러스터 위치: MongoDB Atlas (cluster0.rlrvo4o.mongodb.net)
- Vercel 프로젝트: un-thanks-project
- GitHub 저장소: reallygood83/un-thanks-project

## 향후 개선 사항
1. 설문 응답 수집 기능 구현
2. 설문 결과 통계 및 시각화
3. 관리자 대시보드 구현
4. 편지 승인 시스템
5. 다국어 지원