# MongoDB 통합 가이드

UN 참전국 프로젝트는 이제 MongoDB 데이터베이스를 사용하여 편지 데이터를
영구적으로 저장하고 관리합니다. 이 문서는 MongoDB 설정 및 사용 방법에 대한 가이드입니다.

## 설정 방법

### 1. MongoDB Atlas 계정 생성 및 클러스터 설정

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)에 가입합니다.
2. 무료 티어(M0) 클러스터를 생성합니다.
3. 데이터베이스 접근 사용자를 생성합니다:
   - 사용자 이름 및 비밀번호 설정
   - 읽기/쓰기 권한 부여
4. IP 액세스 리스트에 `0.0.0.0/0`을 추가하여 모든 IP를 허용합니다. (더 안전한 설정을 위해서는 특정 IP만 허용)
5. 연결 문자열을 확인합니다: "Databases" > "Connect" > "Connect your application"

### 2. 환경 변수 설정

다음 환경 변수를 설정해야 합니다:

- `MONGODB_URI`: MongoDB 연결 문자열 (예: `mongodb+srv://username:password@cluster0.mongodb.net/unthanks-db`)
- `MONGODB_DB_NAME`: 데이터베이스 이름 (예: `unthanks-db`)

#### 로컬 개발 환경

로컬 개발 환경에서는 프로젝트 루트에 `.env` 파일을 생성하고 환경 변수를 설정합니다:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/unthanks-db
MONGODB_DB_NAME=unthanks-db
```

#### Vercel 배포 환경

Vercel 프로젝트 설정에서 환경 변수를 추가합니다:

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" > "Environment Variables" 이동
3. 위의 두 환경 변수를 추가

또는 `vercel.json` 파일의 `env` 섹션에 환경 변수를 추가할 수 있습니다(이미 적용됨):

```json
{
  "env": {
    "MONGODB_URI": "mongodb+srv://username:password@cluster0.mongodb.net/unthanks-db",
    "MONGODB_DB_NAME": "unthanks-db"
  }
}
```

## 데이터 모델

### 편지(Letters) 컬렉션

편지 데이터는 `letters` 컬렉션에 저장됩니다. 각 문서는 다음 필드를 포함합니다:

| 필드 | 타입 | 설명 |
|------|------|------|
| _id | ObjectId | 문서 ID (자동 생성) |
| name | String | 작성자 이름 |
| school | String | 학교 이름 (선택) |
| grade | String | 학년 (선택) |
| letterContent | String | 편지 내용 |
| countryId | String | 참전국 ID |
| createdAt | Date | 생성일 |

## 기능 설명

### 1. MongoDB 연결

`frontend/api/_lib/mongodb.js` 파일에서 MongoDB 연결을 관리합니다:

- 연결이 성공하면 MongoDB에서 데이터를 읽고 씁니다.
- 연결이 실패하면 자동으로 더미 데이터 모드로 전환됩니다.

### 2. 편지 저장 (POST /api/submitLetter)

`addLetter` 함수를 통해 새 편지를 MongoDB에 저장합니다:

- 필수 필드 검증 후 MongoDB에 저장
- ObjectId를 생성하여 각 편지의 고유 식별자로 사용
- 연결 실패 시 더미 응답 반환 (사용자 경험 유지)

### 3. 편지 목록 조회 (GET /api/getLetters)

`getLetters` 함수를 통해 저장된 편지 목록을 조회합니다:

- 국가별 필터링 지원 (countryId 파라미터)
- 페이지네이션 지원 (page, limit 파라미터)
- 최신순 정렬
- 연결 실패 시 더미 데이터 반환

### 4. 특정 편지 조회 (GET /api/letters/:id)

`getLetter` 함수를 통해 특정 ID의 편지를 조회합니다:

- ObjectId 또는 문자열 ID 지원
- 저장된 편지가 없으면 404 응답
- 연결 실패 시 더미 데이터 반환

## 주의사항

1. 실제 MongoDB 연결 정보는 보안을 위해 실제 값으로 교체해야 합니다.
2. 프로덕션 환경에서는 더 안전한 인증 및 네트워크 설정을 권장합니다.
3. MongoDB Atlas 무료 티어는 용량 제한이 있으니 대용량 데이터에는 유료 플랜 검토가 필요합니다.