// /api/letters/[id] 엔드포인트 - 특정 ID의 편지 조회
const { getLetter } = require('../_lib/mongodb');

export default async function handler(req, res) {
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
  
  // GET 요청 처리 (특정 편지 조회)
  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Letter ID is required'
      });
    }
    
    const result = await getLetter(id);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      const statusCode = result.error === 'Letter not found' ? 404 : 500;
      return res.status(statusCode).json(result);
    }
  }
  
  // 지원하지 않는 HTTP 메소드
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} Not Allowed`
  });
}