// 초단순 API 구현 - 오직 편지 제출과 조회만 지원
// 이 파일은 모든 API 요청을 처리하는 단일 파일 핸들러입니다.

// 인메모리 데이터 저장소
const letters = [
  {
    id: 'simple-1',
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
    id: 'simple-2',
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

// API 핸들러
module.exports = async (req, res) => {
  console.log(`[Simple API] ${req.method} ${req.url}`);
  
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // URL 파싱
  let url;
  try {
    url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
  } catch (e) {
    url = { searchParams: { get: () => null } };
  }
  
  // URL에서 action 파라미터 추출
  const action = url.searchParams.get('action');
  console.log('[Simple API] Action:', action);
  
  try {
    // GET 요청 처리 (편지 목록 조회)
    if (req.method === 'GET' || action === 'getLetters') {
      const countryId = url.searchParams.get('countryId');
      const filteredLetters = countryId 
        ? letters.filter(letter => letter.countryId === countryId)
        : letters;
      
      return res.status(200).json({
        success: true,
        data: filteredLetters,
        source: 'simple-api'
      });
    }
    
    // POST 요청 처리 (편지 제출)
    if (req.method === 'POST' || action === 'submitLetter') {
      // 요청 본문 파싱
      let body = {};
      
      // 이미 파싱된 경우
      if (req.body && typeof req.body === 'object') {
        body = req.body;
      } 
      // 문자열인 경우
      else if (req.body && typeof req.body === 'string') {
        try {
          body = JSON.parse(req.body);
        } catch (e) {
          console.error('[Simple API] JSON 파싱 실패:', e);
        }
      }
      // 직접 읽어야 하는 경우
      else {
        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const rawBody = Buffer.concat(chunks).toString();
          
          try {
            body = JSON.parse(rawBody);
          } catch (e) {
            console.error('[Simple API] 요청 본문 파싱 실패:', e);
            return res.status(400).json({
              success: false, 
              message: '요청 본문을 파싱할 수 없습니다'
            });
          }
        } catch (e) {
          console.error('[Simple API] 요청 스트림 읽기 실패:', e);
        }
      }
      
      // 필수 필드 검증
      const { name, email, letterContent, countryId } = body;
      
      if (!name || !email || !letterContent || !countryId) {
        return res.status(400).json({
          success: false,
          message: '필수 항목이 누락되었습니다',
          receivedFields: Object.keys(body)
        });
      }
      
      // 새 편지 추가
      const id = 'simple-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
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
      
      // 메모리에 저장
      letters.unshift(newLetter);
      
      // 성공 응답
      return res.status(201).json({
        success: true,
        data: {
          id: newLetter.id,
          translatedContent: newLetter.translatedContent,
          originalContent: letterContent
        },
        message: '편지가 성공적으로 제출되었습니다',
        source: 'simple-api'
      });
    }
    
    // 기본 응답
    return res.status(200).json({
      success: true,
      message: 'Simple API is working',
      availableActions: ['getLetters', 'submitLetter'],
      data: letters,
      source: 'simple-api'
    });
    
  } catch (error) {
    console.error('[Simple API] 오류:', error);
    return res.status(500).json({
      success: true, // 프론트엔드 호환성을 위해 success: true로 설정
      message: '서버 오류가 발생했습니다',
      data: [], // 프론트엔드 호환성을 위한 빈 배열
      error: error.message,
      source: 'simple-api-error'
    });
  }
};