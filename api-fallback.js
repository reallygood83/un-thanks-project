// API 엔드포인트 폴백 핸들러
module.exports = (req, res) => {
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

  const path = req.url.split('?')[0];
  console.log(`API 폴백 처리: ${req.method} ${path}`);

  // 설문 API 경로
  if (path.startsWith('/api/surveys')) {
    return res.status(200).json({
      success: true,
      message: 'API 서버가 준비 중입니다. 임시 데이터를 사용합니다.',
      data: [
        {
          _id: 'temp-survey-1',
          title: '임시 설문 - 미래 통일 한국의 모습',
          description: '이 설문은 학생들이 생각하는 미래 통일 한국의 모습과 기대에 대해 조사합니다.',
          questions: [
            {
              id: 'q1',
              text: '통일 한국의 가장 큰 장점은 무엇이라고 생각하나요?',
              type: 'text',
              required: true
            },
            {
              id: 'q2',
              text: '통일이 된다면 가장 먼저 방문하고 싶은 북한 지역은 어디인가요?',
              type: 'multipleChoice',
              options: ['평양', '백두산', '금강산', '개성', '신의주', '원산', '기타'],
              required: true
            }
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });
  }

  // 디버그 API 경로
  if (path === '/api/debug-surveys') {
    return res.status(200).json({
      success: true,
      message: '디버그 API 폴백 응답',
      request: {
        method: req.method,
        path: path,
        headers: req.headers,
        query: req.query
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV || '설정되지 않음',
        MONGODB_URI: process.env.MONGODB_URI ? '설정됨' : '설정되지 않음'
      }
    });
  }

  // 기본 응답
  return res.status(200).json({
    success: false,
    message: '요청한 API 엔드포인트가 존재하지 않습니다.',
    requestPath: path
  });
};