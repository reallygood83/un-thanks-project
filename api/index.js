// API 루트 경로 핸들러
const { MongoClient } = require('mongodb');

// CORS 헤더 설정 헬퍼 함수
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// API 루트 핸들러
module.exports = async function handler(req, res) {
  // CORS 사전 요청 처리
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // API 정보 반환
  return res.status(200).json({
    status: 'ok',
    message: 'UN 참전국 감사 편지 API가 정상 작동 중입니다',
    version: '1.0.0',
    endpoints: [
      {
        path: '/api/health',
        description: 'API 상태 확인'
      },
      {
        path: '/api/debug-mongodb',
        description: 'MongoDB 연결 디버깅'
      },
      {
        path: '/api/letters',
        description: '편지 목록 조회 및 제출'
      },
      {
        path: '/api/letters/:id',
        description: '특정 ID의 편지 조회'
      },
      {
        path: '/api/countries',
        description: '참전국 목록 조회'
      },
      {
        path: '/api/countries/:id',
        description: '특정 ID의 참전국 정보 조회'
      }
    ],
    timestamp: new Date().toISOString()
  });
};