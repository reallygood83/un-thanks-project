// API - getLetters 편지 목록 조회 처리 (직접 파일 구현)
// 폴더 기반 라우팅이 작동하지 않을 경우의 폴백용
const getLettersHandler = require('./getLetters/index.js');

// 기존 폴더 기반 핸들러로 직접 전달
module.exports = async (req, res) => {
  console.log('[getLetters.js] 요청 받음, 폴더 기반 핸들러로 전달');
  return await getLettersHandler(req, res);
};