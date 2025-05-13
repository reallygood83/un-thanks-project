# UN 참전국 감사 편지 API

이 문서는 UN 참전국 감사 편지 웹 서비스의 API 설명서입니다.

## API 동작 방식

모든 API 요청은 `/api` 엔드포인트로 전달되며, `action` 쿼리 파라미터를 통해 원하는 작업을 지정합니다.

예: `/api?action=getLetters`

## 가용한 액션

### 1. 편지 목록 조회 (getLetters)

- **URL**: `/api?action=getLetters`
- **메서드**: GET
- **선택적 파라미터**:
  - `countryId`: 특정 국가별로 필터링
- **응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "id": "letter-123456",
      "name": "홍길동",
      "school": "서울초등학교",
      "grade": "5학년",
      "letterContent": "감사합니다...",
      "translatedContent": "Thank you...",
      "countryId": "usa",
      "createdAt": "2025-05-01T12:34:56.789Z"
    }
  ],
  "count": 1,
  "timestamp": "2025-05-10T15:30:45.123Z"
}
```

### 2. 편지 제출 (submitLetter)

- **URL**: `/api?action=submitLetter`
- **메서드**: POST
- **필수 요청 본문**:
  - `name`: 작성자 이름
  - `email`: 이메일
  - `letterContent`: 편지 내용
  - `countryId`: 대상 국가 ID
- **선택적 요청 본문**:
  - `school`: 학교
  - `grade`: 학년
- **응답 예시**:
```json
{
  "success": true,
  "data": {
    "id": "letter-123456",
    "translatedContent": "[Translated to English]: 감사합니다...",
    "originalContent": "감사합니다..."
  },
  "message": "편지가 성공적으로 제출되었습니다"
}
```

### 3. 국가 목록 조회 (getCountries)

- **URL**: `/api?action=getCountries`
- **메서드**: GET
- **응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "id": "usa",
      "name": "미국 (United States)",
      "nameKo": "미국",
      "nameEn": "United States",
      "code": "usa",
      "flagCode": "us",
      "participationType": "combat",
      "region": "North America",
      "language": "en"
    }
  ],
  "count": 1
}
```

### 4. 특정 국가 정보 조회 (getCountry)

- **URL**: `/api?action=getCountry&id=usa`
- **메서드**: GET
- **필수 파라미터**:
  - `id`: 국가 ID
- **응답 예시**:
```json
{
  "success": true,
  "data": {
    "id": "usa",
    "name": "미국 (United States)",
    "nameKo": "미국",
    "nameEn": "United States",
    "code": "usa",
    "flagCode": "us",
    "participationType": "combat",
    "region": "North America",
    "language": "en"
  }
}
```

### 5. 헬스 체크 (health)

- **URL**: `/api?action=health`
- **메서드**: GET
- **응답 예시**:
```json
{
  "success": true,
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-05-10T15:30:45.123Z"
}
```

## 오류 응답

오류가 발생할 경우 다음과 같은 형식으로 응답이 반환됩니다:

```json
{
  "success": false,
  "message": "오류 메시지",
  "error": "상세 오류 내용(개발 환경에서만)"
}
```

## 레거시 엔드포인트 지원

이전 버전과의 호환성을 위해 다음 레거시 엔드포인트도 지원됩니다:

- `/api/getLetters` → `/api?action=getLetters`
- `/api/submitLetter` → `/api?action=submitLetter`

## 데이터 저장

현재 버전에서는 데이터가 인메모리 방식으로 저장되며 서버 재시작 시 초기화됩니다. 실제 운영 환경에서는 MongoDB와 같은 영구 저장소에 데이터를 저장하는 것이 권장됩니다.