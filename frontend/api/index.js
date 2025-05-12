// API 루트 엔드포인트
module.exports = function handler(req, res) {
  res.status(200).json({
    message: 'API is working!',
    status: 'ok'
  });
}