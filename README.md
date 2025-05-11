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
- MongoDB
- Google Translate API
- Nodemailer

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

2. 프론트엔드 설치 및 실행
```bash
cd frontend
npm install
npm run dev
```

3. 백엔드 설치 및 실행
```bash
cd ../backend
npm install
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 디렉토리 구조

```
un_thanks_project/
├── frontend/            # 프론트엔드 (React)
│   ├── src/
│   │   ├── components/  # 재사용 가능한 컴포넌트
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── data/        # 정적 데이터 (참전국 정보 등)
│   │   ├── styles/      # 글로벌 스타일
│   │   └── utils/       # 유틸리티 함수
│   └── public/          # 정적 파일 (이미지 등)
│
└── backend/             # 백엔드 (Node.js/Express)
    ├── src/
    │   ├── routes/      # API 라우트
    │   ├── controllers/ # 컨트롤러
    │   ├── models/      # 데이터 모델
    │   ├── services/    # 비즈니스 로직
    │   └── config/      # 설정 파일
    └── .env             # 환경 변수 (미포함)
```

## 환경 변수 설정

백엔드 디렉토리에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/un_thanks_project
JWT_SECRET=your_jwt_secret
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

## 참여 방법

1. 이슈 등록: 버그 리포트, 기능 요청 등
2. 풀 리퀘스트 제출: 코드 개선, 새 기능 추가 등

## 라이센스

이 프로젝트는 MIT 라이센스로 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.