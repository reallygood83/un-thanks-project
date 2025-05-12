// API 루트 경로 핸들러 - 모든 기능 통합
// CommonJS 스타일 사용

function handler(req, res) {
  // CORS 헤더 설정 - 원래 요청의 Origin을 허용하도록 설정
  const requestOrigin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // 인증 정보 포함 허용

  // OPTIONS 요청 즉시 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 모든 요청 정보 로깅
  console.log('API 요청 받음:', {
    method: req.method,
    url: req.url,
    query: req.query || {},
    headers: {
      'content-type': req.headers['content-type'],
      'origin': req.headers['origin']
    }
  });

  // 액션 기반 라우팅 - 수동 쿼리 파싱
  const url = new URL(req.url, `http://${req.headers.host}`);
  const params = url.searchParams;
  const action = params.get('action') || req.query?.action;

  // 액션 기반 처리
  if (action === 'submitLetter' || action === 'createLetter') {
    return handleLetterSubmit(req, res);
  }

  if (action === 'getLetters' || action === 'listLetters') {
    return handleLettersList(req, res);
  }

  if (action === 'getLetter') {
    const id = params.get('id') || req.query?.id;
    if (id) {
      return handleLetterDetail(req, res, id);
    }
  }

  if (action === 'getCountries' || action === 'listCountries') {
    return handleCountriesList(req, res);
  }

  if (action === 'getCountry') {
    const id = params.get('id') || req.query?.id;
    if (id) {
      return handleCountryDetail(req, res, id);
    }
  }

  // 기존 경로 기반 라우팅 유지
  const path = req.url.split('?')[0]; // 쿼리 매개변수 제거

  if (path === '/api/letters' || path === '/api/letters-test') {
    return handleLetters(req, res);
  }

  if (path.startsWith('/api/letters/')) {
    const id = path.replace('/api/letters/', '');
    return handleLetterDetail(req, res, id);
  }

  if (path === '/api/countries') {
    return handleCountries(req, res);
  }

  if (path.startsWith('/api/countries/')) {
    const id = path.replace('/api/countries/', '');
    return handleCountryDetail(req, res, id);
  }

  // 기본 응답: 더미 데이터 포함하여 반환
  console.log('기본 API 응답 반환 - 액션 없음');
  return res.status(200).json({
    success: true,
    message: '통합 API가 정상 작동 중입니다',
    method: req.method,
    path: req.url || '/',
    data: [
      {
        id: 'default-1',
        name: '기본 사용자',
        school: '예시 학교',
        grade: '3학년',
        letterContent: '기본 API 응답에서 생성된 편지 내용입니다.',
        translatedContent: 'This is a letter content from default API response.',
        countryId: 'usa',
        createdAt: new Date().toISOString()
      }
    ],
    timestamp: new Date().toISOString()
  });
}

// 편지 목록 조회 - 액션 기반
function handleLettersList(req, res) {
  // 수동 URL 파싱
  const url = new URL(req.url, `http://${req.headers.host}`);
  const params = url.searchParams;

  const countryId = params.get('countryId') || req.query?.countryId;
  console.log('편지 목록 요청:', { countryId, url: req.url });

  // 더미 편지 데이터
  let letters = [
    {
      id: '1',
      name: '홍길동',
      school: '서울초등학교',
      grade: '5학년',
      letterContent: '감사합니다',
      translatedContent: 'Thank you',
      countryId: 'usa',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '김철수',
      school: '부산중학교',
      grade: '2학년',
      letterContent: '참전해주셔서 감사합니다',
      translatedContent: 'Thank you for your participation',
      countryId: 'uk',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // 국가 필터링 적용
  if (countryId) {
    letters = letters.filter(letter => letter.countryId === countryId);
  }

  return res.status(200).json({
    success: true,
    data: letters
  });
}

// 편지 제출 - 액션 기반
function handleLetterSubmit(req, res) {
  // 요청 본문 로깅
  console.log('편지 제출 요청');

  // 요청 본문 읽기
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      // JSON 파싱
      const data = body ? JSON.parse(body) : {};
      console.log('편지 데이터:', {
        hasName: !!data.name,
        hasEmail: !!data.email,
        hasContent: !!data.letterContent,
        countryId: data.countryId
      });

      // 성공 응답 - 프론트엔드 기대 형식으로 반환
      const responseData = {
        success: true,
        message: '편지가 성공적으로 제출되었습니다',
        data: {
          id: 'test-' + Date.now(),
          translatedContent: '[번역된 내용]: ' + (data.letterContent ? data.letterContent.substring(0, 30) + '...' : ''),
          originalContent: data.letterContent || '원본 내용 (테스트 모드)'
        }
      };

      console.log('응답 데이터:', responseData);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error('요청 본문 파싱 오류:', error);
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 요청 형식',
        error: error.message
      });
    }
  });
}

// 기존 편지 핸들러 (경로 기반)
function handleLetters(req, res) {
  if (req.method === 'GET') {
    // 더미 편지 목록 반환
    return res.status(200).json({
      success: true,
      data: [
        {
          id: '1',
          name: '홍길동',
          school: '서울초등학교',
          grade: '5학년',
          letterContent: '감사합니다',
          translatedContent: 'Thank you',
          countryId: 'usa',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: '김철수',
          school: '부산중학교',
          grade: '2학년',
          letterContent: '참전해주셔서 감사합니다',
          translatedContent: 'Thank you for your participation',
          countryId: 'uk',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    });
  }

  if (req.method === 'POST') {
    // 편지 제출 성공 응답
    return res.status(200).json({
      success: true,
      message: '편지가 성공적으로 제출되었습니다',
      data: {
        id: 'test-' + Date.now(),
        translatedContent: '번역된 내용 (테스트 모드)',
        originalContent: '원본 내용 (테스트 모드)'
      }
    });
  }

  // 지원하지 않는 메서드
  return res.status(405).json({
    success: false,
    message: '지원하지 않는 HTTP 메서드입니다'
  });
}

// 특정 편지 상세 정보
function handleLetterDetail(req, res, id) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        id: id,
        name: '홍길동',
        school: '서울초등학교',
        grade: '5학년',
        letterContent: '참전해주셔서 감사합니다',
        translatedContent: 'Thank you for your participation',
        countryId: 'usa',
        createdAt: new Date().toISOString()
      }
    });
  }
  
  // 지원하지 않는 메서드
  return res.status(405).json({
    success: false,
    message: '지원하지 않는 HTTP 메서드입니다'
  });
}

// 국가 목록 - 액션 기반
function handleCountriesList(req, res) {
  // 더미 국가 데이터
  const countries = [
    {
      id: 'usa',
      nameKo: '미국',
      nameEn: 'United States',
      supportType: 'combat',
      flagCode: 'us'
    },
    {
      id: 'uk',
      nameKo: '영국',
      nameEn: 'United Kingdom',
      supportType: 'combat',
      flagCode: 'gb'
    },
    {
      id: 'france',
      nameKo: '프랑스',
      nameEn: 'France',
      supportType: 'combat',
      flagCode: 'fr'
    },
    {
      id: 'turkey',
      nameKo: '터키',
      nameEn: 'Turkey',
      supportType: 'combat',
      flagCode: 'tr'
    }
  ];

  return res.status(200).json({
    success: true,
    data: countries
  });
}

// 국가 목록 - 경로 기반
function handleCountries(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: 'usa',
          nameKo: '미국',
          nameEn: 'United States',
          supportType: 'combat',
          flagCode: 'us'
        },
        {
          id: 'uk',
          nameKo: '영국',
          nameEn: 'United Kingdom',
          supportType: 'combat',
          flagCode: 'gb'
        }
      ]
    });
  }

  // 지원하지 않는 메서드
  return res.status(405).json({
    success: false,
    message: '지원하지 않는 HTTP 메서드입니다'
  });
}

// 특정 국가 상세 정보
function handleCountryDetail(req, res, id) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        id: id,
        nameKo: id === 'usa' ? '미국' : '영국',
        nameEn: id === 'usa' ? 'United States' : 'United Kingdom',
        supportType: 'combat',
        flagCode: id === 'usa' ? 'us' : 'gb'
      }
    });
  }
  
  // 지원하지 않는 메서드
  return res.status(405).json({
    success: false,
    message: '지원하지 않는 HTTP 메서드입니다'
  });
}

module.exports = handler;