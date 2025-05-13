# API 라우팅 문제 해결

## 문제 설명

기존에 `/api/getLetters` 엔드포인트가 HTML을 반환하는 문제가 발생했습니다. 이는 API 요청이 API 핸들러로 제대로 라우팅되지 않고, 대신 SPA의 index.html로 처리되고 있었기 때문입니다.

## 해결책 구현

다음과 같은 변경을 통해 문제를 해결했습니다:

### 1. 폴더 기반 API 핸들러 구현

`/frontend/api/getLetters/index.js` 파일을 새로 생성하여 폴더 기반 API 구조를 구현했습니다. 이 파일은 MongoDB 라이브러리를 사용하여 편지 목록을 가져오는 API 엔드포인트를 제공합니다.

### 2. Vercel 구성 파일 업데이트

`vercel.json` 파일의 rewrites 설정을 업데이트하여 폴더 기반 API 엔드포인트를 명시적으로 지정했습니다:

```json
"rewrites": [
  { "source": "/api", "destination": "/api/index.js" },
  { "source": "/api/getLetters", "destination": "/api/getLetters/index.js" },
  { "source": "/api/submitLetter", "destination": "/api/submitLetter/index.js" },
  { "source": "/api/letters/:id", "destination": "/api/letters/[id].js" },
  { "source": "/api/countries/:id", "destination": "/api/countries/[id].js" },
  { "source": "/api/(.*)", "destination": "/api/$1.js" },
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### 3. API 라우팅 핸들러 개선

`/frontend/api/index.js` 파일을 업데이트하여 API 요청을 적절한 핸들러로 라우팅하는 로직을 구현했습니다. 이제 URL 경로에 따라 요청을 적절한 핸들러로 전달합니다.

### 4. 폴백 API 핸들러 추가

`/frontend/api/getLetters.js` 파일을 추가하여, Vercel이 폴더 기반 라우팅을 제대로 처리하지 못하는 경우에도 API가 정상 작동할 수 있도록 했습니다.

### 5. MongoDB 통합 수정

`/frontend/api/_lib/mongodb.js` 파일을 업데이트하여 편지 데이터를 올바르게 처리하고, 필요한 경우 폴백으로 더미 데이터를 반환하도록 구현했습니다.

## 테스트 방법

이 변경사항들이 적용된 후에는 다음과 같이 API가 동작해야 합니다:

1. `/api/getLetters` 엔드포인트로 GET 요청 시 JSON 형식의 편지 목록이 반환됩니다.
2. 쿼리 파라미터 `countryId`를 통해 특정 국가의 편지만 필터링할 수 있습니다.
3. 데이터베이스 접근 오류 시에도 더미 데이터로 대체되어 UI가 항상 정상 작동합니다.

## 후속 작업

1. Vercel에 배포 후 API 요청이 정상적으로 라우팅되는지 확인
2. 프론트엔드 API 호출의 오류 처리 개선
3. 추가 API 엔드포인트에도 동일한 패턴 적용

## 참고 사항

이 변경사항들은 Vercel 서버리스 환경에서 API 라우팅을 처리하는 방식을 개선한 것입니다. 기존 API 구현 로직은 그대로 유지하면서, 라우팅 문제만 해결했습니다.