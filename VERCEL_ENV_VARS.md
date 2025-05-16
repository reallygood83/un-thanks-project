# Vercel 환경변수 설정

UN Thanks Project의 MongoDB 직접 연결을 위해 Vercel에 설정해야 할 환경변수입니다.

## 필수 환경변수

| 환경변수 | 설명 | 예시 |
|---------|------|------|
| `MONGODB_URI` | MongoDB 연결 문자열 | `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |
| `MONGODB_DB_NAME` | 사용할 MongoDB 데이터베이스 이름 | `unthanks-db` |
| `GEMINI_API_KEY` | Google Gemini AI API 키 | `AIzaSyC...` |

## Vercel에 환경변수 설정하는 방법

1. Vercel 대시보드 접속
2. 해당 프로젝트 선택
3. "Settings" 탭 클릭
4. "Environment Variables" 섹션으로 이동
5. 각 환경변수의 이름과 값 입력 후 "Add" 버튼 클릭

## vercel.json 파일을 통한 설정 예시

`vercel.json` 파일에 환경변수를 정의할 수도 있습니다:

```json
{
  "env": {
    "MONGODB_URI": "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority",
    "MONGODB_DB_NAME": "unthanks-db"
  }
}
```

## 주의사항

- 실제 프로덕션 환경에서는 보안을 위해 Vercel 대시보드에서 직접 환경변수를 설정하는 것이 좋습니다.
- 비밀번호가 포함된 MongoDB URI는 소스 코드에 직접 포함하지 마세요.
- 필요한 경우 Production/Preview/Development 환경별로 다른 값을 설정할 수 있습니다.