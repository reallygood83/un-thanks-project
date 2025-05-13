# API 디버깅 가이드

## 번역 미리보기 API 디버깅

### API 엔드포인트
- 로컬: `http://localhost:5001/api/translatePreview`
- 배포: `https://your-vercel-domain.vercel.app/api/translatePreview`

### 요청 포맷
```json
{
  "letterContent": "번역할 내용을 입력하세요",
  "countryId": "usa"
}
```

### 응답 포맷 (성공)
```json
{
  "success": true,
  "data": {
    "translatedContent": "Translated content will appear here",
    "originalContent": "Original content that was translated"
  }
}
```

### 테스트 curl 명령어
```bash
# 로컬 환경 테스트
curl -X POST http://localhost:5001/api/translatePreview \
  -H "Content-Type: application/json" \
  -d '{"letterContent":"안녕하세요. 참전해 주셔서 감사합니다.","countryId":"usa"}'

# 배포 환경 테스트
curl -X POST https://your-vercel-domain.vercel.app/api/translatePreview \
  -H "Content-Type: application/json" \
  -d '{"letterContent":"안녕하세요. 참전해 주셔서 감사합니다.","countryId":"usa"}'
```

### 디버깅 체크리스트

1. **요청 로그 확인**
   - 콘솔 로그에서 `[API] 번역 미리보기 처리 시작` 메시지 확인
   - 요청 본문이 올바르게 파싱되었는지 확인

2. **응답 상태 확인**
   - 200: 성공
   - 400: 필수 필드 누락 또는 잘못된 요청
   - 405: 허용되지 않는 메서드 (POST가 아닌 경우)
   - 500: 서버 오류

3. **CORS 이슈 확인**
   - 브라우저 개발자 도구의 네트워크 탭에서 요청 헤더와 응답 헤더 확인
   - `Access-Control-Allow-Origin: *` 헤더가 응답에 포함되었는지 확인

4. **Vercel 배포 관련 이슈**
   - Vercel 로그에서 API 호출 경로가 올바른지 확인
   - `vercel.json` 파일의 routes 설정이 올바른지 확인
   - `translatePreview` 액션이 `index.js`에서 처리되는지 확인

5. **문제 해결 방법**
   - **405 오류 (Method Not Allowed)**: vercel.json에서 해당 경로에 대해 POST 메서드가 허용되어 있는지 확인
   - **API 핸들러가 호출되지 않음**: 브라우저 콘솔에서 요청 URL이 올바른지 확인
   - **HTML 응답 반환**: API 경로가 프론트엔드 경로와 충돌하지 않는지 확인, 또는 경로가 올바르게 라우팅되는지 확인

## API 기본 동작 원리 (Vercel 환경)

1. 클라이언트에서 `/api/translatePreview`로 POST 요청을 보냅니다.
2. Vercel 서버리스 플랫폼은 `vercel.json`의 routes 설정에 따라 요청을 적절한 핸들러로 라우팅합니다.
3. `/api/index.js` 핸들러가 호출되고, 해당 핸들러는 URL 경로에서 `translatePreview` 액션을 추출합니다.
4. 액션에 따라 알맞은 처리 로직을 실행하고 응답을 반환합니다.

직접 경로 방식을 사용하면 쿼리 파라미터 기반 액션 추출보다 더 안정적으로 작동합니다. 