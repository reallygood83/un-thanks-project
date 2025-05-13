# MongoDB 직접 연결 API 구현

이 문서는 UN Thanks Project API를 MongoDB에 직접 연결하여 구현한 내용을 설명합니다. 이전 메모리 기반 구현에서 MongoDB를 직접 사용하는 방식으로 변경하여 데이터 영속성 문제를 해결했습니다.

## 구현 파일

### 1. 핵심 모듈

- **`/api/mongo-direct.js`**: MongoDB 직접 연결 및 처리 모듈
  - `connectMongo()`: MongoDB 연결 함수
  - `addLetterToMongo()`: 편지 저장 함수
  - `getLettersFromMongo()`: 편지 목록 조회 함수
  - `getLetterFromMongo()`: 특정 ID 편지 조회 함수

### 2. API 엔드포인트

- **`/api/submitLetter.js`**: 편지 제출 API (POST)
  - MongoDB에 편지 직접 저장
  - 필수 필드 검증 및 오류 처리 구현

- **`/api/getLetters.js`**: 편지 목록 조회 API (GET)
  - 국가별 필터링, 페이지네이션 지원
  - 오류 발생 시 폴백 응답 제공

- **`/api/getLetter.js`**: 특정 ID 편지 조회 API (GET)
  - MongoDB ObjectId 검증
  - 적절한 HTTP 상태 코드 반환

- **`/api/index.js`**: API 라우팅 및 진입점
  - 모든 API 요청 라우팅 처리
  - CORS 설정 및 전역 오류 처리

### 3. 테스트 및 디버깅

- **`/api/mongo-direct-test.js`**: MongoDB 직접 연결 테스트 스크립트
  - 모든 기능 자동 테스트
  - 사용법: `node mongo-direct-test.js`

## 주요 기능

1. **MongoDB 직접 연결**
   - 환경 변수를 통한 MongoDB URI 및 DB 설정
   - 연결 풀링 및 오류 처리

2. **편지 저장 (POST /api/submitLetter)**
   - 필수 필드 검증 (이름, 편지 내용, 국가 ID)
   - 안전한 MongoDB 문서 저장
   - 저장 결과 및 오류 응답 처리

3. **편지 목록 조회 (GET /api/getLetters)**
   - 국가별 필터링 지원 (countryId 파라미터)
   - 페이지네이션 구현 (page, limit 파라미터)
   - 최신순 정렬 (createdAt 필드 기준)

4. **특정 ID 편지 조회 (GET /api/getLetter/:id)**
   - MongoDB ObjectId 형식 검증
   - 적절한 HTTP 상태 코드 반환
   - 사용자 친화적인 오류 메시지

5. **오류 처리 및 폴백 메커니즘**
   - 모든 API에 try-catch 블록 구현
   - 오류 발생 시 폴백 데이터 제공 (UI 호환성 유지)
   - 상세한 로그 메시지로 디버깅 용이

## API 응답 형식

모든 API는 일관된 응답 형식을 사용합니다:

```javascript
{
  "success": true/false,  // API 성공 여부
  "data": [...],          // 성공 시 반환 데이터
  "error": "오류 메시지",   // 실패 시 오류 메시지
  "message": "안내 메시지", // 사용자용 메시지
  
  // 편지 목록 조회 시 추가 필드
  "total": 50,            // 총 편지 수
  "page": 1,              // 현재 페이지
  "pages": 5              // 전체 페이지 수
}
```

## 변경 사항 비교 (이전 vs 현재)

1. **저장 방식**
   - 이전: 메모리 + MongoDB 연동 (불완전)
   - 현재: MongoDB 직접 연결 (안정적인 영속성)

2. **오류 처리**
   - 이전: 기본적인 오류 처리
   - 현재: 상세 오류 메시지 및 폴백 메커니즘

3. **코드 구조**
   - 이전: 복잡한 연동 구조
   - 현재: 직관적인 직접 연결 방식

## 사용 방법

### 환경 변수 설정

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
MONGODB_DB_NAME=unthanks-db
```

### API 테스트

```bash
# MongoDB 연결 테스트
node api/mongo-direct-test.js

# 편지 제출 테스트
curl -X POST https://yoursite.com/api/submitLetter \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","school":"학교","grade":"학년","letterContent":"내용","countryId":"usa"}'

# 편지 목록 조회 테스트
curl https://yoursite.com/api/getLetters?countryId=usa&page=1&limit=10

# 특정 ID 편지 조회 테스트
curl https://yoursite.com/api/getLetter/60a123456789abcdef123456
```

## 주의 사항

1. MongoDB 연결 정보는 환경 변수로 안전하게 관리해야 합니다.
2. API 요청량이 많을 경우 연결 풀링 설정을 최적화해야 합니다.
3. 실 서비스 배포 전 보안 및 성능 테스트가 필요합니다.

---

구현 완료: MongoDB 직접 연결을 통한 데이터 영속성 확보