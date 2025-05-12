// UN 감사 편지 API - 서버리스 함수 최적화 버전
const letters = [
  {
    id: 'sample-1',
    name: '홍길동',
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
    school: '부산중학교',
    grade: '2학년',
    letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
    translatedContent: 'Thank you for your participation. I express deep gratitude for your sacrifice.',
    countryId: 'uk',
    createdAt: new Date('2025-05-02').toISOString()
  }
];

// 참전국 샘플 데이터
const countries = [
  {
    id: 'usa',
    name: '미국 (United States)',
    code: 'usa',
    participationType: 'combat',
    region: 'North America',
    flag: '/flags/usa.png',
    language: 'en'
  },
  {
    id: 'uk',
    name: '영국 (United Kingdom)',
    code: 'uk',
    participationType: 'combat',
    region: 'Europe',
    flag: '/flags/uk.png',
    language: 'en'
  },
  {
    id: 'turkey',
    name: '터키 (Turkey)',
    code: 'turkey',
    participationType: 'combat',
    region: 'Middle East',
    flag: '/flags/turkey.png',
    language: 'tr'
  }
];

// API 핸들러 함수
module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log(`[API] ${req.method} ${req.url}`);
  
  // URL 파라미터 추출 - Vercel 환경용 최적화
  const url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
  const action = url.searchParams.get('action');
  
  // 요청 본문 사전 파싱 (Vercel 환경에서 자동으로 수행될 수 있음)
  let body = {};
  if (req.body) {
    body = typeof req.body === 'object' ? req.body : 
           typeof req.body === 'string' ? JSON.parse(req.body) : {};
  }
  
  console.log('[API] Action:', action);
  console.log('[API] Has body:', !!req.body);
  
  // API 라우팅 - action 파라미터 기반
  try {
    // 편지 목록 조회
    if (action === 'getLetters') {
      const countryId = url.searchParams.get('countryId');
      const filteredLetters = countryId 
        ? letters.filter(letter => letter.countryId === countryId)
        : letters;
      
      return res.status(200).json({
        success: true,
        data: filteredLetters
      });
    }
    
    // 편지 제출
    if (action === 'submitLetter' && req.method === 'POST') {
      // 요청 본문이 이미 파싱된 경우 사용, 아니면 직접 파싱
      if (Object.keys(body).length === 0) {
        // 직접 요청 본문 읽기 (Vercel에서 자동 파싱되지 않은 경우)
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString();
        try {
          body = JSON.parse(rawBody);
        } catch (e) {
          console.error('[API] JSON 파싱 오류:', e);
          return res.status(400).json({
            success: false,
            message: '잘못된 요청 형식'
          });
        }
      }
      
      // 필수 필드 검증
      const { name, email, letterContent, countryId } = body;
      if (!name || !email || !letterContent || !countryId) {
        return res.status(400).json({
          success: false,
          message: '필수 항목이 누락되었습니다'
        });
      }
      
      // 새 편지 생성
      const id = 'letter-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const newLetter = {
        id,
        name,
        email,
        school: body.school || '',
        grade: body.grade || '',
        letterContent,
        translatedContent: `[번역된 내용]: ${letterContent.substring(0, 30)}...`,
        countryId,
        createdAt: new Date().toISOString()
      };
      
      // 메모리에 저장 (인메모리 저장이므로 서버 재시작시 리셋됨)
      letters.unshift(newLetter);
      
      // 성공 응답
      return res.status(201).json({
        success: true,
        data: {
          id: newLetter.id,
          translatedContent: newLetter.translatedContent,
          originalContent: letterContent
        }
      });
    }
    
    // 국가 목록 조회
    if (action === 'getCountries') {
      return res.status(200).json({
        success: true,
        data: countries
      });
    }
    
    // 알 수 없는 액션이거나 액션이 없는 경우 기본 응답
    return res.status(200).json({
      success: true,
      message: 'API is working!',
      status: 'ok',
      data: letters // 기본 데이터 포함
    });
    
  } catch (error) {
    console.error('[API] 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류: ' + error.message
    });
  }
};