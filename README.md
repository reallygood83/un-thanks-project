# 6.25 UN 참전국 감사 편지 프로젝트

6.25 UN 참전국 감사 편지 프로젝트는 한국전쟁 당시 유엔 참전국들의 숭고한 희생과 헌신을 기억하고, 이에 대한 감사의 마음을 전하기 위한 통일 교육 웹 서비스입니다.

## 프로젝트 기능

- **참전국 정보 제공**: 16개 전투병 파병국, 6개 의료 지원국, 약 40개 물자 지원국 등 총 67개국의 상세 정보 제공
- **감사 편지 작성 및 번역**: 학생들이 참전국에 맞춤형 감사 편지를 작성하면 자동으로 해당 국가의 언어로 번역
- **편지 전송**: 참전국 대사관, 보훈처, 참전용사 협회 등 관련 기관으로 전자 우편 발송
- **교육 콘텐츠**: 6.25 전쟁 및 UN의 역할에 대한 교육 자료 제공

## 기술 스택

### 프론트엔드
- React
- TypeScript
- React Router
- Axios
- Material UI
- CSS

### 백엔드
- Node.js
- Express
- MongoDB (참전국 정보 및 편지 데이터 저장)
- Google Translate API
- Nodemailer

## 주요 업데이트

- MongoDB를 활용한 참전국 정보 및 편지 데이터 관리 시스템 구현
- 국가별 맞춤형 편지 템플릿 디자인 추가
- 실시간 번역 미리보기 기능 구현
- 참전국 통계 대시보드 추가

## 프로젝트 시작하기

### 사전 요구사항
- Node.js 14.x 이상
- npm 또는 yarn
- MongoDB (로컬 또는 Atlas)

### 설치 및 실행

1. 프로젝트 클론
```bash
git clone https://github.com/your-username/un-thanks-project.git
cd un-thanks-project
```

2. 루트 디렉토리에서 의존성 설치
```bash
npm install
npm run install:frontend
```

3. 환경 설정
```bash
cd backend
# .env.example을 .env로 복사하고 필요한 환경 변수 설정
cp .env.example .env
# 데이터베이스에 초기 데이터 생성
npm run seed
cd ..
```

4. 전체 애플리케이션 실행 (프론트엔드 + 백엔드)
```bash
npm run dev
```

5. 또는 개별적으로 실행
```bash
# 백엔드만 실행
npm run dev:backend

# 프론트엔드만 실행
npm run dev:frontend
```

6. 브라우저에서 접속
   - 프론트엔드: `http://localhost:3000`
   - 백엔드 API: `http://localhost:5000`

## 디렉토리 구조

```
un-thanks-project/
├── frontend/                   # 프론트엔드 (React)
│   ├── public/                 # 정적 파일 (이미지 등)
│   │   └── images/             # 프로젝트 이미지
│   ├── src/
│   │   ├── components/         # 재사용 가능한 컴포넌트
│   │   │   ├── common/         # 공통 컴포넌트
│   │   │   ├── countries/      # 국가 관련 컴포넌트
│   │   │   └── letters/        # 편지 관련 컴포넌트
│   │   ├── pages/              # 페이지 컴포넌트
│   │   ├── data/               # 정적 데이터 (참전국 정보 등)
│   │   ├── styles/             # 글로벌 스타일
│   │   └── utils/              # 유틸리티 함수
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                    # 백엔드 (Node.js/Express)
    ├── src/
    │   ├── models/             # MongoDB 모델
    │   ├── routes/             # API 라우트
    │   ├── services/           # 비즈니스 로직
    │   └── server.ts           # 메인 서버 파일
    ├── .env.example            # 환경 변수 예제
    ├── package.json
    └── tsconfig.json
```

## 환경 변수 설정

백엔드 디렉토리에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
# 서버 포트 설정
PORT=5000

# MongoDB 연결 정보
# 로컬: mongodb://localhost:27017/un-thanks-project
# Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/un-thanks-project
MONGODB_URI=mongodb://localhost:27017/un-thanks-project

# Google 번역 API 키 (번역 기능에 필요)
GOOGLE_API_KEY=your_google_api_key

# 이메일 설정 (편지 전송에 필요)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# CORS 설정용 프론트엔드 URL
FRONTEND_URL=http://localhost:3000
```

## MongoDB 설정 가이드

### 로컬 MongoDB 사용

1. MongoDB 설치: [MongoDB 다운로드 페이지](https://www.mongodb.com/try/download/community)에서 최신 버전 설치
2. MongoDB 실행:
   ```bash
   mongod --dbpath=/path/to/data/directory
   ```
3. MongoDB 서버가 기본적으로 `mongodb://localhost:27017`에서 실행됩니다.

### MongoDB Atlas 사용 (클라우드)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)에 가입하고 무료 클러스터 생성
2. 클러스터 설정에서 IP 접근 허용 목록에 개발 환경 IP 추가
3. 데이터베이스 접근 계정 생성 (사용자 이름과 비밀번호)
4. 클러스터의 연결 문자열 복사 및 `.env` 파일에 설정
5. `MONGODB_URI` 형식: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/un-thanks-project`

## API 문서

### 참전국 관련 API

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/countries` | GET | 모든 참전국 목록 조회 |
| `/api/countries/:id` | GET | ID로 특정 참전국 정보 조회 |
| `/api/countries/code/:code` | GET | 국가 코드로 특정 참전국 정보 조회 |
| `/api/countries/type/:type` | GET | 참전 유형별 국가 목록 조회 (combat, medical, material) |
| `/api/countries/search/:query` | GET | 국가 정보 검색 |

### 편지 관련 API

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/letters` | GET | 모든 감사 편지 목록 조회 (쿼리 파라미터 `countryId`로 필터링 가능) |
| `/api/letters/:id` | GET | ID로 특정 편지 조회 |
| `/api/letters/stats/country` | GET | 국가별 편지 통계 조회 |
| `/api/letters` | POST | 새 편지 작성 및 번역 |

#### 편지 작성 요청 예시

```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "school": "서울중학교",
  "grade": "2학년",
  "letterContent": "참전해주셔서 진심으로 감사드립니다...",
  "originalContent": true,
  "countryId": "61a12345b9c4a23d4f567890"
}
```

## 참여 방법

1. 이슈 등록: 버그 리포트, 기능 요청 등
2. 풀 리퀘스트 제출: 코드 개선, 새 기능 추가 등
3. 데이터 기여: 참전국 정보나 역사적 자료 추가

## 라이센스

이 프로젝트는 MIT 라이센스로 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.