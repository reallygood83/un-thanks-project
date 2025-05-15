// 간단한 테스트 엔드포인트
module.exports = async function handler(req, res) {
  console.log('=== submitLetter-test 시작 ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body type:', typeof req.body);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('=== submitLetter-test 끝 ===');
  
  res.status(200).json({
    success: true,
    receivedMethod: req.method,
    receivedBody: req.body,
    receivedType: req.body?.type,
    bodyKeys: req.body ? Object.keys(req.body) : []
  });
}