# Vercel 배포 가이드

이 문서는 6.25 UN 참전국 감사 편지 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 사전 준비

1. [Vercel](https://vercel.com/) 계정 생성
2. [GitHub](https://github.com/) 계정 생성
3. 프로젝트를 GitHub 저장소에 푸시

## GitHub 저장소 설정

1. GitHub에 새 저장소를 생성합니다.
2. 다음 명령어로 원격 저장소를 추가하고 코드를 푸시합니다:

```bash
git remote add origin https://github.com/YOUR_USERNAME/un-thanks-project.git
git push -u origin main
```

## Vercel 배포 단계

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인합니다.
2. "New Project" 버튼을 클릭합니다.
3. GitHub 계정을 연결하고 해당 저장소를 선택합니다.
4. 다음 설정으로 프로젝트를 구성합니다:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. 환경 변수를 설정합니다 (필요한 경우):
   
   - `VITE_API_URL`: 공란으로 두거나 `/api`로 설정

6. "Deploy" 버튼을 클릭합니다.

## 배포 후 확인

1. 배포가 완료되면 제공된 URL로 접속하여 웹사이트가 정상적으로 작동하는지 확인합니다.
2. 모든 페이지와 API 호출이 올바르게 작동하는지 테스트합니다.

## 프로젝트 구조 및 Vercel 설정 설명

### API 라우트

Vercel은 `/api` 디렉토리 내의 파일을 서버리스 함수로 자동 변환합니다. 프로젝트는 다음과 같이 API를 구성했습니다:

- `/api/countries/index.js`: 모든 참전국 데이터를 반환하는 API 엔드포인트
- `/api/countries/[id].js`: 특정 ID의 참전국 정보를 반환하는 API 엔드포인트
- `/api/letters/index.js`: 감사 편지를 제출하는 API 엔드포인트

### Vercel 설정

`vercel.json` 파일은 다음과 같은 설정을 포함합니다:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

- `rewrites`: API 요청과 SPA 라우팅을 처리합니다.
- `buildCommand`: 프로젝트 빌드 명령어를 지정합니다.
- `outputDirectory`: 빌드 결과물이 저장되는 디렉토리를 지정합니다.
- `framework`: 사용하는 프레임워크를 지정합니다.

## 지속적 배포 (CI/CD)

Vercel은 기본적으로 GitHub 저장소와 연결되면 지속적 배포를 설정합니다:

1. `main` 브랜치에 새로운 커밋이 푸시되면 자동으로 배포가 트리거됩니다.
2. 풀 리퐀스트를 생성하면 미리보기 배포(Preview Deployment)가 생성됩니다.

## 자주 발생하는 문제 해결

1. **API 호출 실패**: 환경 변수 `VITE_API_URL`이 올바르게 설정되어 있는지 확인합니다.
2. **빌드 실패**: 빌드 로그를 확인하고 누락된 의존성이 있는지 확인합니다.
3. **라우팅 문제**: `vercel.json`의 rewrites 설정이 올바른지 확인합니다.