// 데이터 저장소 - 메모리에 편지 저장 (서버 재시작 시 초기화됨)
// 실제 프로덕션에서는 데이터베이스나 파일 기반 저장소로 대체 필요
const letterStore = [];

// ID 생성 함수
function generateId() {
  return 'letter-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// 편지 추가
async function addLetter(letter) {
  try {
    console.log('addLetter 함수 실행 시작');
    console.log('받은 데이터:', {
      ...letter,
      letterContent: letter.letterContent ? '내용 있음' : '내용 없음'
    });
    
    // 필수 필드 검증
    if (!letter.name || !letter.letterContent || !letter.countryId) {
      console.log('필수 필드 누락');
      return {
        success: false,
        error: '필수 항목이 누락되었습니다'
      };
    }
    
    // 새 편지 객체 생성
    const newLetter = {
      id: generateId(),
      name: letter.name,
      school: letter.school || '',
      grade: letter.grade || '',
      letterContent: letter.letterContent,
      countryId: letter.countryId,
      createdAt: new Date().toISOString()
    };
    
    // 편지 저장
    letterStore.push(newLetter);
    console.log('편지 저장 완료:', newLetter.id);
    
    // 응답 반환
    return {
      success: true,
      data: newLetter
    };
  } catch (error) {
    console.error('편지 추가 중 오류:', error);
    return {
      success: false,
      error: '편지를 저장하는 중 오류가 발생했습니다',
      message: error.message
    };
  }
}

// 편지 목록 조회
async function getLetters(countryId) {
  try {
    console.log('getLetters 함수 실행 시작, 국가 ID:', countryId);
    
    // 저장된 편지가 없는 경우 기본 데이터 제공
    if (letterStore.length === 0) {
      letterStore.push(
        {
          id: 'sample-1',
          name: '홍길동',
          school: '서울초등학교',
          grade: '5학년',
          letterContent: '참전해주셔서 감사합니다.',
          countryId: 'usa',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample-2',
          name: '김철수',
          school: '부산초등학교', 
          grade: '6학년',
          letterContent: '자유와 평화를 위해 도와주셔서 감사합니다.',
          countryId: 'uk',
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1일 전
        }
      );
    }
    
    // 국가별 필터링
    let letters = letterStore;
    if (countryId) {
      letters = letters.filter(letter => letter.countryId === countryId);
    }
    
    // 날짜 기준 내림차순 정렬 (최신순)
    letters = [...letters].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`${letters.length}개의 편지를 반환합니다`);
    return { 
      success: true, 
      data: letters
    };
  } catch (error) {
    console.error('편지 목록 조회 중 오류:', error);
    return {
      success: false,
      error: '편지 목록을 가져오는 중 오류가 발생했습니다'
    };
  }
}

// 특정 ID의 편지 조회
async function getLetter(id) {
  try {
    console.log('getLetter 함수 실행 시작, ID:', id);
    
    // ID로 편지 찾기
    const letter = letterStore.find(letter => letter.id === id);
    
    if (!letter) {
      console.log('편지를 찾을 수 없음:', id);
      return {
        success: false,
        error: '해당 ID의 편지를 찾을 수 없습니다'
      };
    }
    
    console.log('편지를 찾았습니다:', id);
    return {
      success: true,
      data: letter
    };
  } catch (error) {
    console.error('특정 편지 조회 중 오류:', error);
    return {
      success: false,
      error: '편지를 가져오는 중 오류가 발생했습니다'
    };
  }
}

module.exports = {
  addLetter,
  getLetters,
  getLetter
};