# UN 참전국 감사 편지 웹 서비스 API 테스트 가이드

이 문서는 MongoDB 연결이 성공적으로 구현된 후 API를 테스트하는 방법을 안내합니다.

## 준비 사항

1. MongoDB가 실행 중인지 확인하세요.
2. 백엔드 서버 실행:
   ```
   cd backend
   npm run dev
   ```
3. 테스트 데이터 생성:
   ```
   cd backend
   npm run test:seed
   ```

## API 테스트 방법

### 1. 건강 상태 확인

```bash
curl http://localhost:5001/api/health
```

예상 응답:
```json
{"status":"ok","message":"Server is running"}
```

### 2. 모든 참전국 조회

```bash
curl http://localhost:5001/api/countries
```

### 3. 특정 참전국 ID로 조회

```bash
# 먼저 국가 목록에서 ID 확인
curl http://localhost:5001/api/countries

# 그 후 특정 ID로 조회 (실제 ID 값 사용)
curl http://localhost:5001/api/countries/{국가_ID}
```

### 4. 국가 코드로 참전국 조회

```bash
curl http://localhost:5001/api/countries/code/usa
curl http://localhost:5001/api/countries/code/uk
curl http://localhost:5001/api/countries/code/turkey
```

### 5. 참전 유형별 국가 조회

```bash
curl http://localhost:5001/api/countries/type/combat
```

### 6. 편지 목록 조회

```bash
curl http://localhost:5001/api/letters
```

### 7. 국가별 편지 조회

```bash
# 먼저 국가 목록에서 ID 확인
curl http://localhost:5001/api/countries

# 특정 국가의 편지만 조회
curl http://localhost:5001/api/letters?countryId={국가_ID}
```

### 8. 국가별 편지 통계 조회

```bash
curl http://localhost:5001/api/letters/stats/country
```

### 9. 새 편지 작성 (POST 요청)

```bash
curl -X POST \
  http://localhost:5001/api/letters \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "홍길동",
    "email": "hong@example.com",
    "school": "서울중학교",
    "grade": "2학년",
    "letterContent": "참전해주셔서 진심으로 감사드립니다.",
    "originalContent": true,
    "countryId": "국가_ID"
  }'
```

## 문제 해결

1. 서버 연결 문제가 있다면 서버 로그를 확인하세요.

2. MongoDB 연결 문제가 있다면 다음 명령으로 연결 테스트:
   ```
   cd backend
   npm run test:mongo
   ```

3. 포트 충돌이 있다면 `.env` 파일에서 PORT 값 변경:
   ```
   # Server Configuration
   PORT=5002  # 다른 포트 번호로 변경
   ```

4. 데이터가 표시되지 않는다면 시드 데이터 다시 생성:
   ```
   cd backend
   npm run test:seed
   ```

## 프론트엔드와 함께 테스트

전체 애플리케이션을 테스트하려면 다음 명령으로 실행:

```bash
cd /Users/moon/un-thanks-project
npm run dev
```

이후 브라우저에서 다음 URL 접속:
- 프론트엔드: `http://localhost:3000`
- 백엔드 API: `http://localhost:5001/api/health`