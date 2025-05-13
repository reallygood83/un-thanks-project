// /api/letters 엔드포인트 - 편지 목록 조회
const mongodb = require('../_lib/mongodb');

export default async function handler(req, res) {
  console.log('API 요청 받음:', req.method, req.url);
  
  // CORS 헤더 설정
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
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // GET 요청 처리 (편지 목록 조회)
  if (req.method === 'GET') {
    const countryId = req.query.countryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await mongodb.getLetters(countryId, page, limit);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  }
  
  // 지원하지 않는 HTTP 메소드
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed`
  });
}