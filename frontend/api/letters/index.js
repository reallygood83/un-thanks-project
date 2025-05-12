// /api/letters 엔드포인트 - 편지 목록 조회 및 편지 추가
const { getLetters, addLetter, validateData } = require('../_lib/mongodb');

// 요청 제한 (Rate Limiting) 구현
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분 (ms)
const MAX_REQUESTS_PER_WINDOW = 20; // 1분당 최대 요청 수
const requestLog = {}; // IP별 요청 로그

/**
 * 속도 제한(Rate Limiting) 검사
 * @param {string} ip - 요청자 IP
 * @returns {boolean} - 요청 허용 여부
 */
function checkRateLimit(ip) {
  const now = Date.now();
  
  // IP별 요청 로그 초기화
  if (!requestLog[ip]) {
    requestLog[ip] = [];
  }
  
  // 시간 창 내의 요청만 유지
  requestLog[ip] = requestLog[ip].filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  // 요청 수 제한 확인
  if (requestLog[ip].length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  // 새 요청 기록
  requestLog[ip].push(now);
  return true;
}

/**
 * 서버리스 API 핸들러
 */
export default async function handler(req, res) {
  // 요청 로깅 (IP 익명화)
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const anonymizedIP = clientIP.replace(/\d+\.\d+$/, 'x.x'); // 마지막 두 옥텟을 x.x로 교체
  
  console.log(`API 요청: ${req.method} ${req.url} from ${anonymizedIP}`);
  
  // 속도 제한 검사
  if (!checkRateLimit(clientIP)) {
    console.warn(`속도 제한 초과: ${anonymizedIP}`);
    return res.status(429).json({
      success: false,
      error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    });
  }
  
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  // 도메인 허용 목록 설정
  const allowedOrigins = [
    'https://un-thanks-project.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,POST'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // 보안 헤더 추가
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // GET 요청 처리 (편지 목록 조회)
    if (req.method === 'GET') {
      const countryId = req.query.countryId;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      
      // 페이지 및 한계 유효성 검사
      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: '유효하지 않은 페이지 매개변수'
        });
      }
      
      const result = await getLetters(countryId, page, limit);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(500).json(result);
      }
    }
    
    // POST 요청 처리 (새 편지 추가)
    if (req.method === 'POST') {
      console.log('POST 요청 처리 시작');
      
      // 요청 본문 유효성 검사
      const letterData = req.body;
      if (!letterData || typeof letterData !== 'object') {
        return res.status(400).json({
          success: false,
          error: '유효하지 않은 요청 형식'
        });
      }
      
      // 로깅 (민감 정보 마스킹)
      const logData = {
        hasName: !!letterData.name,
        hasEmail: !!letterData.email,
        countryId: letterData.countryId,
        contentLength: letterData.letterContent ? letterData.letterContent.length : 0
      };
      console.log('요청 데이터:', logData);
      
      // 필수 필드 검증
      const requiredFields = ['name', 'email', 'letterContent', 'countryId'];
      if (!validateData(letterData, requiredFields)) {
        console.log('필수 필드 누락:', {
          hasName: !!letterData.name,
          hasEmail: !!letterData.email,
          hasContent: !!letterData.letterContent,
          hasCountryId: !!letterData.countryId
        });
        
        return res.status(400).json({
          success: false,
          error: '필수 항목이 누락되었습니다'
        });
      }
      
      // 데이터 추가
      console.log('addLetter 함수 호출');
      const result = await addLetter(letterData);
      console.log('추가 결과:', result.success ? '성공' : '실패');
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(500).json(result);
      }
    }
    
    // 지원하지 않는 HTTP 메소드
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  } catch (error) {
    // 예외 처리 - 개발 환경에서만 상세 정보 제공
    console.error('API 요청 처리 중 오류:', error.message);
    const errorResponse = {
      success: false,
      error: '서버 오류가 발생했습니다'
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.message = error.message;
    }
    
    return res.status(500).json(errorResponse);
  }
}