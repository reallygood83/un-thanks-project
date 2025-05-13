// API 라우터 - API 엔드포인트들 간의 라우팅 처리
// Vercel 환경에서 API 요청을 적절한 핸들러로 전달

// API 핸들러들 로드
const simpleApiHandler = require('./_simpleApi.js');
let getLettersHandler;
let submitLetterHandler;

try {
  getLettersHandler = require('./getLetters/index.js');
} catch (error) {
  console.error('getLetters 핸들러 로딩 실패:', error);
}

try {
  submitLetterHandler = require('./submitLetter/index.js');
} catch (error) {
  console.error('submitLetter 핸들러 로딩 실패:', error);
}

// API 라우팅 핸들러
module.exports = async function handler(req, res) {
  console.log(`[API Router] 요청 받음: ${req.method} ${req.url}`);

  // URL 경로 분석
  let path;
  try {
    const url = new URL(req.url, `https://${req.headers.host || 'vercel.app'}`);
    path = url.pathname;
    console.log('[API Router] 경로:', path);
  } catch (error) {
    console.error('[API Router] URL 파싱 오류:', error);
    path = req.url || '/';
  }

  // 기본 CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // API 경로별 라우팅
  if (path.includes('/getLetters') && getLettersHandler) {
    console.log('[API Router] getLetters 핸들러로 라우팅');
    return await getLettersHandler(req, res);
  }

  if (path.includes('/submitLetter') && submitLetterHandler) {
    console.log('[API Router] submitLetter 핸들러로 라우팅');
    return await submitLetterHandler(req, res);
  }

  // 기본 핸들러로 처리 (경로 매칭 실패)
  console.log('[API Router] 특정 핸들러 매칭 실패, 기본 처리');
  return await simpleApiHandler(req, res);
};