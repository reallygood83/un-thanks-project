// MongoDB API 모듈 - 더미 데이터 지원
// 실제 MongoDB 연결에 실패할 경우 더미 데이터를 반환

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
 * 편지 목록 조회
 * @param {string} countryId - 국가 ID (선택적)
 * @param {number} page - 페이지 번호 (선택적, 기본값 1)
 * @param {number} limit - 페이지당 아이템 수 (선택적, 기본값 20)
 * @returns {Promise<{success: boolean, data: Array, total?: number, page?: number, pages?: number}>}
 */
async function getLetters(countryId, page = 1, limit = 20) {
  console.log('[mongodb] getLetters 호출:', { countryId, page, limit });
  
  try {
    // 더미 데이터 (실제 구현에서는 MongoDB에서 데이터 가져오기)
    const dummyLetters = [
      {
        _id: '1',
        name: '홍길동',
        school: '서울초등학교',
        grade: '5학년',
        letterContent: '감사합니다',
        countryId: 'usa',
        createdAt: new Date()
      },
      {
        _id: '2',
        name: '김철수',
        school: '부산초등학교',
        grade: '6학년',
        letterContent: '고맙습니다',
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
      countryId: letter.countryId,
      createdAt: letter.createdAt instanceof Date ? letter.createdAt.toISOString() : letter.createdAt
    }));
    
    return {
      success: true,
      data: formattedLetters,
      total: dummyLetters.length,
      page: page,
      pages: Math.ceil(dummyLetters.length / limit)
    };
  } catch (error) {
    console.error('[mongodb] getLetters 오류:', error);
    throw error;
  }
}

/**
 * 특정 ID의 편지 조회
 * @param {string} id - 편지 ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function getLetter(id) {
  console.log(`[mongodb] getLetter 호출 (ID: ${id})`);
  
  try {
    return {
      success: true,
      data: {
        id: id,
        name: '홍길동',
        school: '서울초등학교',
        grade: '5학년',
        letterContent: '참전해주셔서 감사합니다',
        countryId: 'usa',
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`[mongodb] getLetter 오류 (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * 새 편지 추가
 * @param {Object} letterData - 편지 데이터
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function addLetter(letterData) {
  console.log('[mongodb] addLetter 호출:', {
    name: letterData.name,
    school: letterData.school,
    grade: letterData.grade,
    countryId: letterData.countryId,
    contentLength: letterData.letterContent?.length
  });
  
  try {
    // 필수 필드 검증
    const requiredFields = ['name', 'letterContent', 'countryId'];
    if (!validateData(letterData, requiredFields)) {
      return {
        success: false,
        error: '필수 항목이 누락되었습니다'
      };
    }
    
    // 새 편지 ID 생성
    const newId = 'letter-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    
    return {
      success: true,
      data: {
        id: newId,
        originalContent: letterData.letterContent
      }
    };
  } catch (error) {
    console.error('[mongodb] addLetter 오류:', error);
    throw error;
  }
}

// 편지 데이터 검증
function validateLetterData(letterData) {
  return validateData(letterData, ['name', 'letterContent', 'countryId']);
}

// 모듈 내보내기
module.exports = {
  connectToDatabase: async () => ({ client: null, db: null }),  // 아무것도 하지 않는 더미 함수
  getLetters,
  getLetter,
  addLetter,
  validateData,
  validateLetterData
};