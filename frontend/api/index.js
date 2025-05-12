// API 루트 엔드포인트 - 초단순 API 핸들러로 요청 직접 처리
// 프로덕션 환경에서 API 요청 처리용

// 초단순 API 핸들러 직접 로드
const simpleApiHandler = require('./_simpleApi.js');

// API 핸들러 - 가장 단순한 형태로 구현
module.exports = async function handler(req, res) {
  console.log(`[Frontend API] 요청 받음: ${req.method} ${req.url}`);
  
  // 초단순 API 핸들러로 직접 요청 처리
  return await simpleApiHandler(req, res);
};