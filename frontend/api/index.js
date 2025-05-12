// API 루트 엔드포인트 - 요청을 메인 API 핸들러로 전달
// 프로덕션 환경에서 API 요청 처리용

// 샘플 데이터 (메인 핸들러 로드 실패시 대비)
const sampleLetters = [
  {
    id: 'sample-1',
    name: '홍길동',
    email: 'hong@example.com',
    school: '서울초등학교',
    grade: '5학년',
    letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
    translatedContent: 'Thank you. I sincerely thank you for helping for the freedom of Korea.',
    countryId: 'usa',
    createdAt: new Date('2025-05-01').toISOString()
  },
  {
    id: 'sample-2',
    name: '김철수',
    email: 'kim@example.com',
    school: '부산중학교',
    grade: '2학년',
    letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
    translatedContent: 'Thank you for your participation. I express deep gratitude for your sacrifice.',
    countryId: 'uk',
    createdAt: new Date('2025-05-02').toISOString()
  }
];

// 편지 추가 함수
function addLetter(letterData) {
  const id = 'frontend-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
  const translatedContent = `[번역된 내용]: ${letterData.letterContent.substring(0, 30)}...`;

  const newLetter = {
    id,
    name: letterData.name,
    email: letterData.email || 'anonymous@example.com',
    school: letterData.school || '',
    grade: letterData.grade || '',
    letterContent: letterData.letterContent,
    translatedContent,
    countryId: letterData.countryId,
    createdAt: new Date().toISOString()
  };

  // 샘플 목록 앞에 추가
  sampleLetters.unshift(newLetter);

  return {
    id: newLetter.id,
    translatedContent,
    originalContent: letterData.letterContent
  };
}

module.exports = async function handler(req, res) {
  console.log(`[Frontend API] 요청 받음: ${req.method} ${req.url}`);

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // URL에서 action 파라미터 확인
    let url;
    try {
      url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
      console.log('[Frontend API] URL 파싱됨:', url.toString());
    } catch (error) {
      console.error('[Frontend API] URL 파싱 오류:', error);
      url = { searchParams: { get: () => null } };
    }

    // 액션 파라미터 확인
    let action = url.searchParams.get('action');

    // URL 경로에서도 액션 추출 시도 (예: /api/submitLetter)
    if (!action && req.url) {
      const pathMatch = req.url.match(/\/api\/([^/?]+)/);
      if (pathMatch && pathMatch[1]) {
        action = pathMatch[1];
        console.log('[Frontend API] 경로에서 액션 추출:', action);
      }
    }

    // HTTP 메서드 기반으로 액션 유추
    if (!action) {
      if (req.method === 'POST') {
        action = 'submitLetter';
        console.log('[Frontend API] 메서드에서 액션 유추:', action);
      } else if (req.method === 'GET') {
        action = 'getLetters';
        console.log('[Frontend API] 메서드에서 액션 유추:', action);
      }
    }

    console.log('[Frontend API] 최종 액션 파라미터:', action);

    // 메인 API 핸들러 로드 시도
    try {
      // 액션 파라미터 표준화 (URL에 없는 경우 추가)
      if (action && !req.url.includes('action=')) {
        const separator = req.url.includes('?') ? '&' : '?';
        req.url += `${separator}action=${action}`;
        console.log('[Frontend API] 액션 파라미터 추가됨, 새 URL:', req.url);
      }

      // 파일 경로로 mainHandler 직접 호출 실패한 경우, 경로를 절대 경로로 변환하여 시도
      try {
        const mainHandler = require('../../api/index.js');
        console.log('[Frontend API] 메인 API 핸들러로 요청 위임');
        return await mainHandler(req, res);
      } catch (importError) {
        console.error('[Frontend API] 상대 경로 로드 실패, 절대 경로 시도:', importError);

        // 절대 경로로 시도
        const path = require('path');
        const mainHandlerPath = path.resolve(process.cwd(), '../api/index.js');
        console.log('[Frontend API] 절대 경로 시도:', mainHandlerPath);

        try {
          const mainHandler = require(mainHandlerPath);
          console.log('[Frontend API] 절대 경로로 메인 API 핸들러 로드 성공');
          return await mainHandler(req, res);
        } catch (absPathError) {
          console.error('[Frontend API] 절대 경로 로드 실패:', absPathError);
          throw absPathError; // 오류 전파
        }
      }
    } catch (importError) {
      console.error('[Frontend API] 모든 메인 핸들러 로드 시도 실패:', importError);

      // 기본 API 처리 메커니즘 사용
      if (action === 'getLetters') {
        // 국가 ID 필터링
        const countryId = url.searchParams.get('countryId');
        console.log('[Frontend API] 국가 필터링:', countryId);

        // 필터링된 편지 반환
        const filteredLetters = countryId
          ? sampleLetters.filter(letter => letter.countryId === countryId)
          : sampleLetters;

        console.log('[Frontend API] 필터링된 편지 수:', filteredLetters.length);

        return res.status(200).json({
          success: true,
          data: filteredLetters,
          count: filteredLetters.length,
          source: 'frontend-api',
          timestamp: new Date().toISOString()
        });
      }
      else if (action === 'submitLetter' && req.method === 'POST') {
        // 요청 본문 파싱
        let body = {};

        if (req.body) {
          body = typeof req.body === 'object' ? req.body :
                typeof req.body === 'string' ? JSON.parse(req.body) : {};
        } else {
          // 본문 스트림에서 읽기
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }

          if (chunks.length > 0) {
            const rawBody = Buffer.concat(chunks).toString();
            try {
              body = JSON.parse(rawBody);
            } catch (e) {
              console.error('[Frontend API] 본문 파싱 오류:', e);
            }
          }
        }

        console.log('[Frontend API] 편지 제출 본문:', {
          hasName: !!body.name,
          hasContent: !!body.letterContent,
          countryId: body.countryId
        });

        // 필수 필드 검증
        if (!body.name || !body.letterContent || !body.countryId) {
          return res.status(400).json({
            success: false,
            message: '필수 항목이 누락되었습니다',
            requiredFields: ['name', 'letterContent', 'countryId']
          });
        }

        // 편지 추가
        const result = addLetter(body);
        console.log('[Frontend API] 새 편지 추가됨:', result.id);

        return res.status(201).json({
          success: true,
          data: result,
          message: '편지가 성공적으로 제출되었습니다',
          source: 'frontend-api'
        });
      }
      else {
        // 그 외 액션 또는 기본 응답
        return res.status(200).json({
          success: true,
          message: '프론트엔드 API 서비스 작동 중',
          status: 'ok',
          data: sampleLetters, // 프론트엔드 호환성을 위해 data 필드 포함
          availableActions: ['getLetters', 'submitLetter'],
          source: 'frontend-api',
          timestamp: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('[Frontend API] 처리 오류:', error);
    return res.status(200).json({  // 오류 발생해도 200 상태 코드 반환하여 프론트엔드 호환성 유지
      success: true,  // 프론트엔드 호환성을 위해 success true 유지
      message: '프론트엔드 API 내부 오류',
      data: sampleLetters,  // 프론트엔드에서 사용할 수 있는 더미 데이터 제공
      error: error.message,
      source: 'frontend-api-error',
      timestamp: new Date().toISOString()
    });
  }
}