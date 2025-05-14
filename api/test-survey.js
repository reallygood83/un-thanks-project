// 간단한 테스트 엔드포인트
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  res.status(200).json({
    success: true,
    message: 'Test survey endpoint works (CommonJS)',
    method: req.method,
    url: req.url,
    time: new Date().toISOString()
  });
};