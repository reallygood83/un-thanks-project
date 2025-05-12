// 편지 목록 API 핸들러 - 특정 action 전용
module.exports = (req, res) => {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // URL에서 countryId 파라미터 직접 추출
  const url = new URL(req.url, `http://${req.headers.host}`);
  const countryId = url.searchParams.get('countryId');
  
  console.log('getLetters API 호출됨, countryId:', countryId);
  
  // 샘플 편지 데이터
  let letters = [
    {
      id: '1',
      name: '홍길동',
      school: '서울초등학교',
      grade: '5학년',
      letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
      translatedContent: 'Thank you. I sincerely thank you for helping for the freedom of Korea.',
      countryId: 'usa',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '김철수',
      school: '부산중학교',
      grade: '2학년',
      letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
      translatedContent: 'Thank you for your participation. I express deep gratitude for your sacrifice.',
      countryId: 'uk',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      name: '이영희',
      school: '대전고등학교',
      grade: '1학년',
      letterContent: '대한민국의 자유와 평화를 위해 싸워주셔서 감사합니다.',
      translatedContent: 'Thank you for fighting for the freedom and peace of South Korea.',
      countryId: 'turkey',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  // 국가별 필터링 적용
  if (countryId) {
    letters = letters.filter(letter => letter.countryId === countryId);
  }
  
  // 프론트엔드에서 기대하는 형식으로 응답
  return res.status(200).json({
    success: true,
    data: letters
  });
};