// 테스트 API - Vercel 서버리스 함수가 정상적으로 동작하는지 확인용
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Vercel 서버리스 함수가 정상적으로 동작 중입니다',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    api_version: '1.0.0'
  });
}