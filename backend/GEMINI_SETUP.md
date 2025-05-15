# Google Gemini API 설정 가이드

## 소개

이 프로젝트의 AI 설문 생성 기능은 Google의 Gemini API를 사용합니다. 이 가이드에서는 Gemini API를 설정하고 프로젝트에 연결하는 방법을 설명합니다.

## Gemini API 키 발급 방법

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속합니다.
2. Google 계정으로 로그인합니다.
3. "Get API key" 버튼을 클릭합니다.
4. 새 API 키를 생성하고 안전한 곳에 저장합니다.

## 프로젝트에 Gemini API 키 설정하기

1. 백엔드 디렉토리에 `.env` 파일을 생성합니다.
2. 다음 내용을 추가합니다:

```
# Gemini API 설정
GEMINI_API_KEY=your-gemini-api-key
```

3. `your-gemini-api-key`를 발급받은 API 키로 교체합니다.

## API 키 작동 확인하기

API 키가 제대로 작동하는지 테스트하려면 다음 명령어를 실행합니다:

```bash
cd backend
node test-gemini.js
```

테스트가 성공하면 "테스트 성공! Gemini API가 정상적으로 작동합니다."라는 메시지가 표시됩니다.

## 문제 해결

### API 키 오류

"GEMINI_API_KEY가 설정되지 않았습니다" 오류가 발생하는 경우:
- `.env` 파일이 백엔드 디렉토리에 있는지 확인합니다.
- API 키가 올바른 형식으로 입력되었는지 확인합니다.

### 응답 오류

"테스트 실패" 오류가 발생하는 경우:
- API 키가 유효한지 확인합니다.
- 인터넷 연결을 확인합니다.
- 하루 API 사용량 제한에 도달하지 않았는지 확인합니다.

## 사용 방법

API 키 설정이 완료되면 프론트엔드에서 "AI 모드로 전환" 버튼을 클릭하여 AI 설문 생성 기능을 사용할 수 있습니다.

AI 프롬프트 입력 필드에 원하는 설문 주제와 내용에 대한 설명을 입력하고 "AI로 설문 생성하기" 버튼을 클릭하세요.

## 사용량 제한

Google Gemini API는 무료 사용자에게 일정한 요청 제한을 적용합니다. 자세한 내용은 [Gemini API 요금 정책](https://ai.google.dev/pricing)을 참조하세요. 