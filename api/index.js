// API 루트 경로 핸들러 - 모든 기능 통합
// CommonJS 스타일 사용

function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONS 요청 즉시 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 요청 로깅
  console.log('API 요청:', {
    method: req.method,
    url: req.url,
    query: req.query,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type']
    }
  });
  
  // URL 경로에 따라 다른 핸들러 호출
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
  
  // 기본 응답: API 정보 반환
  return res.status(200).json({
    success: true,
    message: '통합 API가 정상 작동 중입니다',
    method: req.method,
    path: req.url || '/',
    timestamp: new Date().toISOString()
  });
}

// 편지 목록 또는 제출 처리
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

// 국가 목록
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