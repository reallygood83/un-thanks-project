// MongoDB API 모듈 - 더미 데이터 지원 (서버사이드 메모리 저장소 사용)
// 실제 MongoDB 연결이 구현되기 전까지 임시로 사용

// 메모리 내 편지 저장소 (서버 세션 동안 유지)
let lettersStore = [
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
  console.log('[메모리저장소] getLetters 호출:', { countryId, page, limit });
  
  try {
    // 메모리 내 저장소에서 편지 데이터 가져오기
    const letters = [...lettersStore];
    
    // 국가별 필터링
    const filtered = countryId 
      ? letters.filter(letter => letter.countryId === countryId)
      : letters;
    
    // 정렬: 최신순
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = filtered.slice(startIndex, endIndex);
    
    // 포맷팅된 응답
    const formattedLetters = paginatedData.map(letter => ({
      id: letter._id,
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt instanceof Date ? letter.createdAt.toISOString() : letter.createdAt
    }));
    
    return {
      success: true,
      data: formattedLetters,
      total: filtered.length,
      page: page,
      pages: Math.ceil(filtered.length / limit)
    };
  } catch (error) {
    console.error('[메모리저장소] getLetters 오류:', error);
    throw error;
  }
}

/**
 * 특정 ID의 편지 조회
 * @param {string} id - 편지 ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function getLetter(id) {
  console.log(`[메모리저장소] getLetter 호출 (ID: ${id})`);
  
  try {
    // 메모리 내 저장소에서 해당 ID의 편지 찾기
    const letter = lettersStore.find(letter => letter._id === id);
    
    if (!letter) {
      return {
        success: false,
        error: 'Letter not found'
      };
    }
    
    return {
      success: true,
      data: {
        id: letter._id,
        name: letter.name,
        school: letter.school || '',
        grade: letter.grade || '',
        letterContent: letter.letterContent,
        countryId: letter.countryId,
        createdAt: letter.createdAt instanceof Date ? letter.createdAt.toISOString() : letter.createdAt
      }
    };
  } catch (error) {
    console.error(`[메모리저장소] getLetter 오류 (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * 새 편지 추가
 * @param {Object} letterData - 편지 데이터
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function addLetter(letterData) {
  console.log('[메모리저장소] addLetter 호출:', {
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
    
    // 새 편지 객체 생성
    const newLetter = {
      _id: newId,
      name: letterData.name,
      school: letterData.school || '',
      grade: letterData.grade || '',
      letterContent: letterData.letterContent,
      countryId: letterData.countryId,
      createdAt: new Date()
    };
    
    // 메모리 내 저장소에 새 편지 추가
    lettersStore.push(newLetter);
    
    console.log('[메모리저장소] 새 편지가 추가되었습니다. 현재 총 편지 수:', lettersStore.length);
    
    return {
      success: true,
      data: {
        id: newId,
        originalContent: letterData.letterContent
      }
    };
  } catch (error) {
    console.error('[메모리저장소] addLetter 오류:', error);
    throw error;
  }
}

// MongoDB 연결 모의 함수 (실제로는 아무것도 하지 않음)
async function connectToDatabase() {
  return { client: null, db: null };
}

// 편지 데이터 검증
function validateLetterData(letterData) {
  return validateData(letterData, ['name', 'letterContent', 'countryId']);
}

// 모듈 내보내기
module.exports = {
  connectToDatabase,
  getLetters,
  getLetter,
  addLetter,
  validateData,
  validateLetterData
};