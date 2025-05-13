// 편지 제출 테스트 API - 데이터베이스 연결 없이 기본 기능만 제공
const { v4: uuidv4 } = require('uuid');

// CORS 헤더 설정 헬퍼 함수
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// 요청 본문 파싱 함수
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) {
      // 이미 파싱된 경우
      if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return resolve(req.body);
      }
      
      // 문자열인 경우 JSON 파싱 시도
      if (typeof req.body === 'string') {
        try {
          return resolve(JSON.parse(req.body));
        } catch (error) {
          console.error('Body parsing error:', error);
          return reject(new Error('Invalid JSON body'));
        }
      }
    }
    
    // 본문이 없는 경우
    let bodyStr = '';
    req.on('data', chunk => {
      bodyStr += chunk.toString();
    });
    
    req.on('end', () => {
      if (!bodyStr) {
        return resolve({});
      }
      
      try {
        const parsedBody = JSON.parse(bodyStr);
        resolve(parsedBody);
      } catch (error) {
        console.error('Body parsing error:', error);
        reject(new Error('Invalid JSON body'));
      }
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
  });
}

// 편지 테스트 API 핸들러
module.exports = async function handler(req, res) {
  // 요청 로깅 (더 자세한 정보 포함)
  console.log('편지 테스트 API 요청:', {
    method: req.method,
    url: req.url,
    query: req.query,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers['origin'],
      'host': req.headers['host']
    },
    body: req.body ? '있음' : '없음'
  });

  // CORS 사전 요청 처리
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // CORS 헤더 설정
  setCorsHeaders(res);

  try {
    // GET 요청 처리 - 더미 편지 목록 반환
    if (req.method === 'GET') {
      // 더미 데이터 생성
      const dummyLetters = [
        {
          id: uuidv4(),
          name: '홍길동',
          school: '서울초등학교',
          grade: '5학년',
          letterContent: '감사합니다.',
          translatedContent: 'Thank you.',
          countryId: 'usa',
          createdAt: new Date()
        },
        {
          id: uuidv4(),
          name: '김철수',
          school: '부산중학교',
          grade: '2학년',
          letterContent: '참전해주셔서 감사합니다.',
          translatedContent: 'Merci d\'avoir participé.',
          countryId: 'france',
          createdAt: new Date(Date.now() - 86400000) // 하루 전
        }
      ];
      
      return res.status(200).json({
        success: true,
        data: dummyLetters
      });
    }
    
    // POST 요청 처리 - 편지 제출 시뮬레이션
    if (req.method === 'POST') {
      // POST 요청 처리 시작 로깅
      console.log('POST 요청 처리 시작...');

      // 요청 본문 파싱
      let body;
      try {
        console.log('요청 본문 파싱 시도:', {
          bodyType: typeof req.body,
          hasBody: !!req.body,
          contentType: req.headers['content-type']
        });

        body = await parseBody(req);
        console.log('Parsed request body:', body);
      } catch (error) {
        console.error('Body parsing error:', error);
        return res.status(400).json({
          message: '요청 본문 파싱 오류: ' + error.message,
          success: false
        });
      }
      
      const { 
        name, 
        email, 
        school, 
        grade, 
        letterContent, 
        originalContent, 
        countryId 
      } = body || {};
      
      // 필수 필드 유효성 검사
      if (!name || !email || !letterContent || !countryId) {
        console.log('필수 필드 누락:', { name, email, letterContentLength: letterContent?.length, countryId });
        return res.status(400).json({
          message: '필수 항목이 누락되었습니다',
          success: false
        });
      }
      
      // 가상 번역 로직
      const translatedContent = `[${countryId} 언어로 번역된 내용: ${letterContent.substring(0, 30)}...]`;
      
      // 새 편지 ID 생성
      const letterId = uuidv4();
      
      // 성공 응답 반환 (실제 DB 저장 없음)
      return res.status(201).json({
        message: '편지가 성공적으로 제출되었습니다 (테스트 모드)',
        success: true,
        data: {
          id: letterId,
          translatedContent,
          originalContent: letterContent
        }
      });
    }
    
    // 지원하지 않는 HTTP 메서드
    return res.status(405).json({ 
      message: '지원하지 않는 메서드입니다',
      success: false 
    });
    
  } catch (error) {
    console.error('편지 API 오류:', error);
    return res.status(500).json({
      message: '서버 오류가 발생했습니다: ' + error.message,
      success: false
    });
  }
};