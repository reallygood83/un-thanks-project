// 편지 목록 조회 API 핸들러 - MongoDB 연동
const { connectToDatabase } = require('./_lib/mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// 편지 목록 조회 API 핸들러
module.exports = async function handler(req, res) {
  try {
    // CORS 헤더 설정
    setCorsHeaders(res);

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // GET 요청이 아니면 405 오류 반환
    if (req.method !== 'GET') {
      console.error('허용되지 않은 메서드:', req.method);
      return res.status(405).json({
        success: false,
        message: '허용되지 않은 HTTP 메서드입니다. GET 요청만 허용됩니다.'
      });
    }

    // URL에서 쿼리 파라미터 추출
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const countryId = url.searchParams.get('countryId') || req.query?.countryId;

    console.log('getLetters API 호출됨 - MongoDB 연동 버전', { countryId });

    try {
      // MongoDB 연결
      const { db } = await connectToDatabase();
      const collection = db.collection('letters');

      // 쿼리 조건 설정
      const query = countryId ? { countryId } : {};
      
      // 편지 목록 조회 (최신순)
      const letters = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100) // 결과 수 제한
        .toArray();
      
      // 개인정보 제거하여 반환
      const sanitizedLetters = letters.map(letter => ({
        id: letter._id,
        name: letter.name,
        school: letter.school || '',
        grade: letter.grade || '',
        letterContent: letter.letterContent,
        translatedContent: letter.translatedContent,
        countryId: letter.countryId,
        createdAt: letter.createdAt
      }));

      console.log(`편지 목록 조회 결과: ${sanitizedLetters.length}개 항목`);

      // 성공 응답 반환
      return res.status(200).json({
        success: true,
        data: sanitizedLetters
      });
    } catch (dbError) {
      console.error('MongoDB 오류:', dbError);
      
      // 개발 환경에서 임시 데이터 반환
      console.log('MongoDB 연결 실패, 임시 데이터 반환');
      
      // 임시 더미 데이터
      const dummyLetters = [
        {
          id: 'dummy-1',
          name: '홍길동',
          school: '서울초등학교',
          grade: '5학년',
          letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
          translatedContent: 'Thank you. I sincerely thank you for helping for the freedom of Korea.',
          countryId: countryId || 'usa',
          createdAt: new Date().toISOString()
        },
        {
          id: 'dummy-2',
          name: '김철수',
          school: '부산중학교',
          grade: '2학년',
          letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
          translatedContent: 'Thank you for your participation. I express deep gratitude for your sacrifice.',
          countryId: countryId || 'uk',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      // 국가별 필터링 적용
      const filteredLetters = countryId 
        ? dummyLetters.filter(letter => letter.countryId === countryId)
        : dummyLetters;
      
      return res.status(200).json({
        success: true,
        data: filteredLetters,
        fallback: true
      });
    }
  } catch (error) {
    console.error('getLetters API 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다: ' + error.message
    });
  }
};