// 디버깅 목적의 API 엔드포인트
module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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

  try {
    // 요청 정보 수집
    const requestInfo = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI ? '설정됨' : '설정안됨',
        MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
      }
    };

    console.log('디버그 요청 정보:', JSON.stringify(requestInfo, null, 2));

    // 간단한 응답 반환
    return res.status(200).json({
      success: true,
      message: '디버그 API 정상 작동 중',
      request: requestInfo
    });
  } catch (error) {
    console.error('디버그 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: '디버그 API 오류',
      error: error.message
    });
  }
};