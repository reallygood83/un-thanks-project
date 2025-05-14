// /api/surveys 엔드포인트 - 설문 목록 조회 (편지 API와 동일한 패턴)
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// 설문 목록 조회 API 핸들러
module.exports = async (req, res) => {
  console.log('surveys API 호출 (편지 API와 동일한 패턴):', req.method, req.url);
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드',
      message: 'GET 요청만 허용됩니다'
    });
  }
  
  try {
    // 쿼리 파라미터 추출
    let countryId, page, limit;
    
    // URL 파싱 방식
    if (req.url) {
      try {
        const urlObj = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
        countryId = urlObj.searchParams.get('countryId');
