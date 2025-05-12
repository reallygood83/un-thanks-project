// UN 감사 편지 API - 서버리스 함수 최적화 버전
// 메모리 저장소 (서버리스 함수가 재실행될 때마다 초기화됨)
const letters = [
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
  },
  {
    id: 'sample-3',
    name: '이영희',
    email: 'lee@example.com',
    school: '대구고등학교',
    grade: '1학년',
    letterContent: '한국 전쟁 참전에 감사드립니다. 여러분의 도움 덕분에 지금의 한국이 있을 수 있었습니다.',
    translatedContent: 'Thank you for participating in the Korean War. Thanks to your help, Korea could exist as it is today.',
    countryId: 'turkey',
    createdAt: new Date('2025-05-03').toISOString()
  }
];

// 참전국 샘플 데이터
const countries = [
  {
    id: 'usa',
    name: '미국 (United States)',
    nameKo: '미국',
    nameEn: 'United States',
    code: 'usa',
    flagCode: 'us',
    participationType: 'combat',
    region: 'North America',
    flag: '/flags/usa.png',
    language: 'en'
  },
  {
    id: 'uk',
    name: '영국 (United Kingdom)',
    nameKo: '영국',
    nameEn: 'United Kingdom',
    code: 'uk',
    flagCode: 'gb',
    participationType: 'combat',
    region: 'Europe',
    flag: '/flags/uk.png',
    language: 'en'
  },
  {
    id: 'turkey',
    name: '터키 (Turkey)',
    nameKo: '터키',
    nameEn: 'Turkey',
    code: 'turkey',
    flagCode: 'tr',
    participationType: 'combat',
    region: 'Middle East',
    flag: '/flags/turkey.png',
    language: 'tr'
  },
  {
    id: 'canada',
    name: '캐나다 (Canada)',
    nameKo: '캐나다',
    nameEn: 'Canada',
    code: 'canada',
    flagCode: 'ca',
    participationType: 'combat',
    region: 'North America',
    flag: '/flags/canada.png',
    language: 'en'
  },
  {
    id: 'australia',
    name: '호주 (Australia)',
    nameKo: '호주',
    nameEn: 'Australia',
    code: 'australia',
    flagCode: 'au',
    participationType: 'combat',
    region: 'Oceania',
    flag: '/flags/australia.png',
    language: 'en'
  }
];

// 간단한 번역 함수 (실제로는 번역 API 사용 필요)
function translateText(text, targetLanguage) {
  // 실제 구현에서는 번역 API 호출
  const translations = {
    'en': `[Translated to English]: ${text.substring(0, 50)}...`,
    'tr': `[Türkçe'ye çevrildi]: ${text.substring(0, 50)}...`,
    'default': `[Translated]: ${text.substring(0, 50)}...`
  };

  return translations[targetLanguage] || translations.default;
}

// 요청 본문 파싱 도우미 함수
async function parseRequestBody(req) {
  // 이미 파싱된 경우
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    console.log('[API] 사전 파싱된 body 사용');
    return req.body;
  }

  // 문자열로 파싱된 경우
  if (req.body && typeof req.body === 'string') {
    console.log('[API] 문자열 body 파싱 시도');
    try {
      return JSON.parse(req.body);
    } catch (e) {
      console.error('[API] JSON 문자열 파싱 오류:', e);
    }
  }

  // 수동 파싱 필요
  console.log('[API] 수동으로 body 파싱 시도');
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString();

    // 빈 body 체크
    if (!rawBody || rawBody.trim() === '') {
      console.log('[API] 빈 body');
      return {};
    }

    try {
      return JSON.parse(rawBody);
    } catch (e) {
      console.error('[API] 수동 JSON 파싱 오류:', e);
      console.log('[API] 원시 body:', rawBody);
      return {};
    }
  } catch (error) {
    console.error('[API] 요청 파싱 오류:', error);
    return {};
  }
}

// API 핸들러 함수
module.exports = async (req, res) => {
  // 디버깅: 요청 전체 로깅
  console.log(`[API] ${req.method} ${req.url}`);
  console.log('[API] Headers:', req.headers);

  // CORS 헤더 설정 - 모든 출처 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 (프리플라이트) 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // URL 파라미터 추출 - Vercel 환경용 최적화
  let url;
  try {
    url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
  } catch (error) {
    console.error('[API] URL 파싱 오류:', error);
    url = { searchParams: { get: () => null } };
  }

  // 액션 파라미터 추출 (URL에서 또는 경로에서)
  let action = url.searchParams.get('action');

  // URL 경로에서도 액션 추출 시도 (예: /api/submitLetter)
  if (!action && req.url) {
    const pathMatch = req.url.match(/\/api\/([^/?]+)/);
    if (pathMatch && pathMatch[1]) {
      action = pathMatch[1];
      console.log('[API] 경로에서 액션 추출:', action);
    }
  }

  console.log('[API] Action:', action);

  // API 라우팅 - action 파라미터 기반
  try {
    // 편지 목록 조회 (getLetters)
    if (action === 'getLetters') {
      const countryId = url.searchParams.get('countryId');
      console.log('[API] 편지 목록 조회 - 국가 필터:', countryId || '전체');

      const filteredLetters = countryId
        ? letters.filter(letter => letter.countryId === countryId)
        : letters;

      return res.status(200).json({
        success: true,
        data: filteredLetters,
        count: filteredLetters.length,
        timestamp: new Date().toISOString()
      });
    }

    // 편지 제출 (submitLetter)
    if ((action === 'submitLetter' || action === 'submitletter') && (req.method === 'POST')) {
      console.log('[API] 편지 제출 처리 시작');

      // 요청 본문 파싱
      const body = await parseRequestBody(req);
      console.log('[API] 파싱된 요청 본문:', body);
      console.log('[API] 요청 헤더:', req.headers);

      // 비어있는 body 확인
      if (!body || Object.keys(body).length === 0) {
        console.error('[API] 요청 본문이 비어있거나 파싱 실패');
        return res.status(400).json({
          success: false,
          message: '요청 본문이 비어있거나 파싱할 수 없습니다',
          helpInfo: 'Content-Type: application/json 헤더를 확인하세요'
        });
      }

      // 필수 필드 검증 - 더 상세한 로깅 추가
      const { name, email, letterContent, countryId, originalContent } = body;
      console.log('[API] 편지 필드 확인:', {
        hasName: !!name,
        hasEmail: !!email,
        contentLength: letterContent ? letterContent.length : 0,
        countryId,
        originalContent,
        bodyKeys: Object.keys(body)
      });

      if (!name || !email || !letterContent || !countryId) {
        console.log('[API] 필수 필드 누락:', {
          hasName: !!name,
          hasEmail: !!email,
          hasContent: !!letterContent,
          hasCountryId: !!countryId
        });
        return res.status(400).json({
          success: false,
          message: '필수 항목이 누락되었습니다',
          missingFields: [
            !name ? 'name' : null,
            !email ? 'email' : null,
            !letterContent ? 'letterContent' : null,
            !countryId ? 'countryId' : null
          ].filter(Boolean),
          receivedFields: Object.keys(body)
        });
      }

      // 국가 검증
      const country = countries.find(c => c.id === countryId);
      if (!country) {
        console.log('[API] 잘못된 국가 ID:', countryId);
        return res.status(400).json({
          success: false,
          message: '존재하지 않는 국가 ID입니다',
          providedId: countryId
        });
      }

      // 새 편지 ID 생성
      const id = 'letter-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

      // 번역 수행 (실제 구현에서는 번역 API 사용)
      const translatedContent = translateText(letterContent, country.language);

      // 새 편지 객체 생성
      const newLetter = {
        id,
        name,
        email,
        school: body.school || '',
        grade: body.grade || '',
        letterContent,
        translatedContent,
        countryId,
        createdAt: new Date().toISOString()
      };

      // 메모리에 저장 (인메모리 저장이므로 서버 재시작시 리셋됨)
      letters.unshift(newLetter);
      console.log('[API] 새 편지 저장 완료:', newLetter.id);

      // 성공 응답
      return res.status(201).json({
        success: true,
        data: {
          id: newLetter.id,
          translatedContent: newLetter.translatedContent,
          originalContent: letterContent
        },
        message: '편지가 성공적으로 제출되었습니다'
      });
    }

    // 국가 목록 조회 (getCountries)
    if (action === 'getCountries') {
      console.log('[API] 국가 목록 조회');
      return res.status(200).json({
        success: true,
        data: countries,
        count: countries.length
      });
    }

    // 국가 상세 정보 조회 (getCountry)
    if (action === 'getCountry') {
      const countryId = url.searchParams.get('id');
      console.log('[API] 국가 상세 정보 조회:', countryId);

      if (!countryId) {
        return res.status(400).json({
          success: false,
          message: '국가 ID가 필요합니다'
        });
      }

      const country = countries.find(c => c.id === countryId);
      if (!country) {
        return res.status(404).json({
          success: false,
          message: '해당 국가를 찾을 수 없습니다'
        });
      }

      return res.status(200).json({
        success: true,
        data: country
      });
    }

    // 건강 확인 (health)
    if (action === 'health') {
      return res.status(200).json({
        success: true,
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // 알 수 없는 액션이거나 액션이 없는 경우 기본 응답
    console.log('[API] 알 수 없는 액션 또는 기본 응답:', action);

    // 편지 목록 기본으로 반환 (data 필드 보장)
    return res.status(200).json({
      success: true,
      message: 'UN 참전국 감사 편지 API가 정상 작동 중입니다',
      status: 'ok',
      data: letters, // 항상 data 필드 포함
      availableActions: ['getLetters', 'submitLetter', 'getCountries', 'getCountry', 'health'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] 처리 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};