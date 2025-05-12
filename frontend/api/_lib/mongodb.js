// 더미 데이터 모듈 - MongoDB 의존성 제거
// 모든 함수는 더미 데이터를 반환하며 실제 데이터베이스 연결 없이 작동

/**
 * 입력 데이터 검증
 * @param {Object} data - 검증할 데이터 객체
 * @param {Array<string>} requiredFields - 필수 필드 목록
 * @returns {boolean} 검증 결과
 */
function validateData(data, requiredFields) {
  if (!data || typeof data !== 'object') return false;
  
  return requiredFields.every(field => {
    return data[field] !== undefined && data[field] !== null && data[field] !== '';
  });
}

/**
 * 편지 목록 조회 (더미 데이터)
 * @param {string} countryId - 국가 ID (선택적)
 * @param {number} page - 페이지 번호 (선택적, 기본값 1)
 * @param {number} limit - 페이지당 아이템 수 (선택적, 기본값 20)
 * @returns {Promise<{success: boolean, data: Array, total?: number, page?: number, pages?: number}>}
 */
async function getLetters(countryId, page = 1, limit = 20) {
  console.log('더미 편지 목록 반환 (MongoDB 없음)');
  
  // 더미 데이터
  const dummyLetters = [
    {
      _id: '1',
      name: '홍길동',
      school: '서울초등학교',
      grade: '5학년',
      letterContent: '감사합니다',
      translatedContent: 'Thank you',
      countryId: 'usa',
      createdAt: new Date()
    },
    {
      _id: '2',
      name: '김철수',
      school: '부산초등학교',
      grade: '6학년',
      letterContent: '고맙습니다',
      translatedContent: 'Thank you very much',
      countryId: 'uk',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];
  
  // 국가별 필터링
  const filtered = countryId 
    ? dummyLetters.filter(letter => letter.countryId === countryId)
    : dummyLetters;
  
  // 포맷팅된 응답
  const formattedLetters = filtered.map(letter => ({
    id: letter._id,
    name: letter.name,
    school: letter.school,
    grade: letter.grade,
    letterContent: letter.letterContent,
    translatedContent: letter.translatedContent,
    countryId: letter.countryId,
    createdAt: letter.createdAt
  }));
  
  return {
    success: true,
    data: formattedLetters,
    total: dummyLetters.length,
    page: page,
    pages: Math.ceil(dummyLetters.length / limit)
  };
}

/**
 * 특정 ID의 편지 조회 (더미 데이터)
 * @param {string} id - 편지 ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function getLetter(id) {
  console.log(`더미 편지 상세 정보 반환 (ID: ${id}, MongoDB 없음)`);
  
  return {
    success: true,
    data: {
      id: id,
      name: '홍길동',
      school: '서울초등학교',
      grade: '5학년',
      letterContent: '참전해주셔서 감사합니다',
      translatedContent: 'Thank you for your participation',
      countryId: 'usa',
      createdAt: new Date()
    }
  };
}

/**
 * 새 편지 추가 (더미 응답)
 * @param {Object} letterData - 편지 데이터
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function addLetter(letterData) {
  console.log('더미 편지 추가 (MongoDB 없음):', letterData);
  
  // 필수 필드 검증
  const requiredFields = ['name', 'email', 'letterContent', 'countryId'];
  if (!validateData(letterData, requiredFields)) {
    return {
      success: false,
      error: '필수 항목이 누락되었습니다'
    };
  }
  
  // 가상 번역
  const translatedContent = `[${letterData.countryId} 언어로 번역된 내용: ${letterData.letterContent.substring(0, 30)}...]`;
  
  return {
    success: true,
    data: {
      id: 'dummy-' + Date.now(),
      translatedContent,
      originalContent: letterData.letterContent
    }
  };
}

// 모듈 내보내기
module.exports = {
  connectToDatabase: async () => ({ client: null, db: null }),  // 아무것도 하지 않는 더미 함수
  getLetters,
  getLetter,
  addLetter,
  validateData
};