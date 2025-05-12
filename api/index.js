// 단일 통합 API 핸들러 - 서버리스 환경 최적화
// 이 파일은 모든 API 요청을 처리하며 데이터베이스 의존성 없이 작동합니다

// 메모리 내 데이터 저장소 (서버리스 환경에서는 재시작마다 초기화됨)
const letters = [
  {
    id: 'sample-1',
    name: '홍길동',
    school: '서울초등학교',
    grade: '5학년',
    letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
    translatedContent: 'Thank you. I sincerely thank you for helping for the freedom of Korea.',
    countryId: 'usa',
    createdAt: new Date('2025-05-01').toISOString()
  },
  {
    id: 'sample-2',
    name: '김철수',
    school: '부산중학교',
    grade: '2학년',
    letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
    translatedContent: 'Thank you for your participation. I express deep gratitude for your sacrifice.',
    countryId: 'uk',
    createdAt: new Date('2025-05-02').toISOString()
  },
  {
    id: 'sample-3',
    name: '이영희',
    school: '대전고등학교',
    grade: '1학년',
    letterContent: '대한민국의 자유와 평화를 위해 싸워주셔서 감사합니다.',
    translatedContent: 'Thank you for fighting for the freedom and peace of South Korea.',
    countryId: 'turkey',
    createdAt: new Date('2025-05-03').toISOString()
  }
];

// 참전국 데이터
const countries = [
  {
    id: 'usa',
    name: '미국 (United States)',
    code: 'usa',
    participationType: 'combat',
    region: 'North America',
    flag: '/flags/usa.png',
    language: 'en',
    description: '미국은 한국전쟁에서 가장 많은 병력을 파견한 국가로, UN군의 중추적 역할을 담당했습니다.'
  },
  {
    id: 'uk',
    name: '영국 (United Kingdom)',
    code: 'uk',
    participationType: 'combat',
    region: 'Europe',
    flag: '/flags/uk.png',
    language: 'en',
    description: '영국은 미국에 이어 두 번째로 많은 병력을 파견한 유럽 국가입니다.'
  },
  {
    id: 'turkey',
    name: '터키 (Turkey)',
    code: 'turkey',
    participationType: 'combat',
    region: 'Middle East',
    flag: '/flags/turkey.png',
    language: 'tr',
    description: '터키는 미국 다음으로 많은 병력을 파견한 국가로, 군인들의 용맹함으로 유명합니다.'
  },
  {
    id: 'canada',
    name: '캐나다 (Canada)',
    code: 'canada',
    participationType: 'combat',
    region: 'North America',
    flag: '/flags/canada.png',
    language: 'en',
    description: '캐나다는 육해공군을 모두 파견하여 UN군의 일원으로 참전했습니다.'
  }
];

// ID 생성 헬퍼 함수
function generateId() {
  return 'letter-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

// API 핸들러
module.exports = function handler(req, res) {
  // CORS 헤더 설정 - 모든 출처에서의 요청 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 즉시 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`API 요청: ${req.method} ${req.url}`);
  
  try {
    // URL에서 action 파라미터 직접 추출
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const action = url.searchParams.get('action');
    
    console.log('요청 액션:', action);

    // action이 없는 경우 기본 응답
    if (!action) {
      console.log('액션 없음 - 기본 응답');
      return res.status(200).json({
        success: true,
        message: 'API is working!',
        status: 'ok',
        data: letters.slice(0, 2) // 기본 데이터 제공
      });
    }

    // 편지 목록 조회
    if (action === 'getLetters') {
      console.log('getLetters 액션 처리');
      const countryId = url.searchParams.get('countryId');
      const filteredLetters = countryId
        ? letters.filter(letter => letter.countryId === countryId)
        : letters;
      
      return res.status(200).json({
        success: true,
        data: filteredLetters
      });
    }

    // 편지 제출
    if (action === 'submitLetter' && req.method === 'POST') {
      console.log('submitLetter 액션 처리 (POST)');
      
      // 요청 본문 읽기
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          // JSON 파싱
          const data = body ? JSON.parse(body) : {};
          console.log('편지 데이터 받음:', {
            hasName: !!data.name,
            hasEmail: !!data.email,
            contentLength: data.letterContent ? data.letterContent.length : 0,
            countryId: data.countryId
          });

          // 필수 필드 검증
          if (!data.name || !data.email || !data.letterContent || !data.countryId) {
            return res.status(400).json({
              success: false,
              message: '필수 항목이 누락되었습니다.'
            });
          }

          // 새 편지 생성
          const newLetter = {
            id: generateId(),
            name: data.name,
            email: data.email,
            school: data.school || '',
            grade: data.grade || '',
            letterContent: data.letterContent,
            translatedContent: `[${data.countryId} 언어로 번역]: ${data.letterContent.substring(0, 30)}...`,
            countryId: data.countryId,
            createdAt: new Date().toISOString()
          };

          // 메모리에 저장 (서버리스 함수 재시작 시 초기화됨)
          letters.unshift(newLetter);
          console.log('새 편지 저장됨:', newLetter.id);

          // 성공 응답
          return res.status(201).json({
            success: true,
            message: '편지가 성공적으로 제출되었습니다',
            data: {
              id: newLetter.id,
              translatedContent: newLetter.translatedContent,
              originalContent: data.letterContent
            }
          });
        } catch (error) {
          console.error('요청 처리 중 오류:', error);
          return res.status(400).json({
            success: false,
            message: '잘못된 요청 형식: ' + error.message
          });
        }
      });

      // 요청이 비동기적으로 처리되므로 여기서 응답하지 않음
      return;
    }

    // 국가 목록 조회
    if (action === 'getCountries') {
      console.log('getCountries 액션 처리');
      return res.status(200).json({
        success: true,
        data: countries
      });
    }

    // 특정 국가 조회
    if (action === 'getCountry') {
      console.log('getCountry 액션 처리');
      const id = url.searchParams.get('id');
      if (!id) {
        return res.status(400).json({
          success: false,
          message: '국가 ID가 필요합니다'
        });
      }

      const country = countries.find(c => c.id === id);
      if (!country) {
        return res.status(404).json({
          success: false,
          message: `ID ${id}에 해당하는 국가를 찾을 수 없습니다`
        });
      }

      return res.status(200).json({
        success: true,
        data: country
      });
    }

    // 지원하지 않는 액션
    console.log('지원하지 않는 액션:', action);
    return res.status(400).json({
      success: false,
      message: `지원하지 않는 액션: ${action}`
    });

  } catch (error) {
    console.error('API 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류: ' + error.message
    });
  }
};