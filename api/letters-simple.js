// 메모리 기반 편지 저장소 (서버 재시작시 초기화됨)
let lettersCollection = [
  {
    id: '1',
    name: '홍길동',
    school: '서울초등학교',
    grade: '5학년',
    letterContent: '감사합니다. 한국의 자유를 위해 도와주셔서 진심으로 감사드립니다.',
    countryId: 'usa',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: '김철수',
    school: '부산초등학교',
    grade: '6학년',
    letterContent: '참전해주셔서 감사합니다. 여러분의 희생에 깊은 감사를 표합니다.',
    countryId: 'uk',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

/**
 * 편지 추가 함수
 * @param {Object} letter - 편지 데이터
 * @returns {Object} 결과 객체
 */
function addLetter(letter) {
  try {
    // 필수 필드 검증
    if (!letter.name || !letter.letterContent || !letter.countryId) {
      return {
        success: false,
        error: '필수 항목이 누락되었습니다'
      };
    }
    
    // 새 편지 ID 생성
    const newId = 'letter-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    
    // 저장할 문서 생성
    const newLetter = {
      id: newId,
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      countryId: letter.countryId,
      createdAt: new Date().toISOString()
    };
    
    // 메모리 저장소에 추가
    lettersCollection.push(newLetter);
    
    console.log(`[addLetter] 새 편지가 추가되었습니다. ID: ${newId}`);
    console.log(`[addLetter] 현재 총 편지 수: ${lettersCollection.length}`);
    
    return {
      success: true,
      data: {
        id: newId,
        originalContent: letter.letterContent
      }
    };
  } catch (error) {
    console.error('[addLetter] 오류:', error);
    return {
      success: false,
      error: '편지 저장 중 오류가 발생했습니다'
    };
  }
}

/**
 * 편지 목록 조회 함수
 * @param {Object} options - 조회 옵션
 * @returns {Object} 결과 객체
 */
function getLetters(options = {}) {
  try {
    const { countryId, page = 1, limit = 20 } = options;
    
    // 국가별 필터링
    let filtered = [...lettersCollection];
    if (countryId) {
      filtered = filtered.filter(letter => letter.countryId === countryId);
    }
    
    // 최신순 정렬
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 총 항목 수
    const total = filtered.length;
    
    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = filtered.slice(startIndex, endIndex);
    
    // 총 페이지 수
    const pages = Math.ceil(total / limit);
    
    console.log(`[getLetters] ${filtered.length}개 중 ${paginatedData.length}개 반환 (페이지: ${page}/${pages})`);
    
    return {
      success: true,
      data: paginatedData,
      total,
      page,
      pages
    };
  } catch (error) {
    console.error('[getLetters] 오류:', error);
    return {
      success: false,
      error: '편지 목록 조회 중 오류가 발생했습니다'
    };
  }
}

/**
 * 특정 ID의 편지 조회 함수
 * @param {string} id - 편지 ID
 * @returns {Object} 결과 객체
 */
function getLetter(id) {
  try {
    if (!id) {
      return {
        success: false,
        error: '편지 ID가 필요합니다'
      };
    }
    
    // ID로 편지 찾기
    const letter = lettersCollection.find(item => item.id === id);
    
    if (!letter) {
      return {
        success: false,
        error: '해당 ID의 편지를 찾을 수 없습니다'
      };
    }
    
    return {
      success: true,
      data: letter
    };
  } catch (error) {
    console.error('[getLetter] 오류:', error);
    return {
      success: false,
      error: '편지 조회 중 오류가 발생했습니다'
    };
  }
}

module.exports = {
  addLetter,
  getLetters,
  getLetter
};