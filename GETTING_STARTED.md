# 6.25 UN 참전국 감사 프로젝트 시작하기

이 문서는 6.25 UN 참전국 감사 프로젝트를 설정하고 실행하는 방법을 안내합니다.

## 사전 요구사항

- Node.js 14.x 이상
- npm 또는 yarn
- MongoDB (실제 배포 시 필요)

## 프론트엔드 설정 및 실행

1. 프론트엔드 디렉토리로 이동합니다.
   ```bash
   cd ~/un_thanks_project/frontend
   ```

2. 필요한 패키지를 설치합니다.
   ```bash
   npm install
   ```

3. 개발 서버를 시작합니다.
   ```bash
   npm run dev
   ```

4. 브라우저에서 `http://localhost:3000`으로 접속하여 웹 서비스를 확인합니다.

## 백엔드 설정 및 실행

1. 백엔드 디렉토리로 이동합니다.
   ```bash
   cd ~/un_thanks_project/backend
   ```

2. 필요한 패키지를 설치합니다.
   ```bash
   npm install
   ```

3. `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
   ```bash
   cp .env.example .env
   ```

4. `.env` 파일을 열고 필요한 환경 변수를 설정합니다.
   - MongoDB 연결 문자열
   - Google Translate API 키 (편지 번역 기능에 필요)
   - 이메일 발송 서비스 정보 (편지 전송 기능에 필요)

5. 개발 서버를 시작합니다.
   ```bash
   npm run dev
   ```

6. 백엔드 서버가 `http://localhost:5000`에서 실행됩니다.

## 프로젝트 구조

### 프론트엔드 (React)

```
frontend/
├── src/
│   ├── components/       # UI 컴포넌트
│   │   ├── common/       # 공통 컴포넌트 (Header, Footer 등)
│   │   ├── countries/    # 참전국 관련 컴포넌트
│   │   └── letters/      # 편지 작성 관련 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   ├── data/             # 참전국 데이터
│   └── styles/           # CSS 스타일
├── public/               # 정적 파일
└── index.html            # HTML 엔트리 포인트
```

### 백엔드 (Node.js/Express)

```
backend/
├── src/
│   ├── routes/           # API 라우트 정의
│   ├── controllers/      # 컨트롤러 로직
│   ├── models/           # 데이터 모델 (MongoDB)
│   ├── services/         # 비즈니스 로직
│   └── server.ts         # 서버 엔트리 포인트
├── .env                  # 환경 변수
└── tsconfig.json         # TypeScript 설정
```

## 주요 기능 사용법

1. **참전국 정보 보기**: 홈페이지에서 "참전국 정보 보기" 버튼 클릭 또는 상단 메뉴에서 "참전국 정보" 클릭
2. **국가별 상세 정보**: 참전국 목록에서 원하는 국가 카드의 "자세히 보기" 버튼 클릭
3. **감사 편지 작성**: 국가 상세 페이지 또는 참전국 목록에서 "감사 편지 쓰기" 버튼 클릭
4. **프로젝트 소개**: 상단 메뉴에서 "프로젝트 소개" 클릭

## 개발 작업

### 데이터 추가 및 수정

참전국 데이터는 `frontend/src/data/participatingCountries.ts` 파일에 있습니다. 이 파일을 수정하여 참전국 정보를 추가하거나 업데이트할 수 있습니다.

### 스타일 커스터마이징

글로벌 스타일은 `frontend/src/styles/global.css`에 있으며, 각 컴포넌트의 스타일은 해당 컴포넌트 디렉토리에 있는 CSS 파일에 정의되어 있습니다.

### 번역 서비스 연결

실제 번역 기능을 구현하려면 백엔드의 letter.ts 라우트에서 Google Cloud Translation API 또는 다른 번역 서비스를 연결해야 합니다.

## 추가 개발 사항

1. 현재는 참전국 데이터가 프론트엔드에 정적으로 포함되어 있습니다. 백엔드 API에서 데이터를 가져오도록 구현할 수 있습니다.
2. 편지 작성 및 발송 기능이 현재는 모의 구현되어 있습니다. 실제 번역 및 이메일 발송 기능을 구현해야 합니다.
3. 사용자 계정 및 인증 기능이 필요한 경우 추가할 수 있습니다.
4. 편지 작성 이력 및 발송 상태 확인 기능을 추가할 수 있습니다.