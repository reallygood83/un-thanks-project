// 편지 서비스 - 편지 관련 기능 처리
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase, sampleLetters, validateLetterData } = require('../_lib/mongodb');

/**
 * 편지 목록 조회
 * @param {string} countryId - 국가 ID (필터링용, 선택적)
 * @param {number} page - 페이지 번호 (기본값: 1)
 * @param {number} limit - 페이지당 항목 수 (기본값: 20)
 * @returns {Promise<Object>} - 편지 목록
 */
async function getLetters(countryId = null, page = 1, limit = 20) {
  try {
    console.log('[letterService] getLetters 호출:', { countryId, page, limit });
    
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');
    
    // 쿼리 조건 설정
    const query = countryId ? { countryId } : {};
    
    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    
    // 편지 목록 조회 (최신순)
    const letters = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 전체 개수 조회
    const total = await collection.countDocuments(query);
    
    console.log(`[letterService] ${letters.length}개 편지 조회 완료 (총 ${total}개)`);
    
    return {
      success: true,
      data: letters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('[letterService] 편지 목록 조회 오류:', error);
    
    // 오류 발생 시 샘플 데이터 반환
    const filteredLetters = countryId
      ? sampleLetters.filter(letter => letter.countryId === countryId)
      : sampleLetters;
    
    return {
      success: true, // 프론트엔드 호환성을 위해 success: true 유지
      data: filteredLetters,
      fallback: true,
      message: '데이터베이스 연결 실패, 샘플 데이터 반환'
    };
  }
}

/**
 * 편지 ID로 조회
 * @param {string} id - 편지 ID
 * @returns {Promise<Object>} - 편지 데이터
 */
async function getLetterById(id) {
  try {
    console.log('[letterService] getLetterById 호출:', { id });
    
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');
    
    // 편지 조회
    const letter = await collection.findOne({ _id: id });
    
    if (!letter) {
      return {
        success: false,
        message: '편지를 찾을 수 없습니다.'
      };
    }
    
    return {
      success: true,
      data: letter
    };
  } catch (error) {
    console.error('[letterService] 편지 조회 오류:', error);
    
    // 샘플 데이터에서 검색
    const sampleLetter = sampleLetters.find(letter => letter._id === id);
    
    return {
      success: sampleLetter ? true : false,
      data: sampleLetter || null,
      fallback: true,
      message: sampleLetter ? '샘플 데이터 반환' : '편지를 찾을 수 없습니다.'
    };
  }
}

/**
 * 새 편지 추가
 * @param {Object} letterData - 편지 데이터
 * @returns {Promise<Object>} - 추가된 편지 정보
 */
async function addLetter(letterData) {
  try {
    console.log('[letterService] addLetter 호출:', {
      name: letterData.name,
      school: letterData.school,
      grade: letterData.grade,
      countryId: letterData.countryId,
      contentLength: letterData.letterContent?.length
    });
    
    // 데이터 유효성 검증
    if (!validateLetterData(letterData)) {
      return {
        success: false,
        message: '필수 항목이 누락되었습니다.',
        requiredFields: ['name', 'letterContent', 'countryId']
      };
    }
    
    // 새 편지 객체 생성 (번역 필드 제거)
    const newLetter = {
      _id: uuidv4(), // UUID 생성
      name: letterData.name,
      school: letterData.school || '',
      grade: letterData.grade || '',
      letterContent: letterData.letterContent,
      countryId: letterData.countryId,
      createdAt: new Date()
    };
    
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');
    
    // 편지 저장
    const result = await collection.insertOne(newLetter);
    
    if (!result.acknowledged) {
      throw new Error('편지 저장에 실패했습니다.');
    }
    
    console.log('[letterService] 편지 저장 성공:', {
      id: newLetter._id,
      acknowledged: result.acknowledged
    });
    
    return {
      success: true,
      data: {
        id: newLetter._id,
        originalContent: letterData.letterContent
      },
      message: '편지가 성공적으로 저장되었습니다.'
    };
  } catch (error) {
    console.error('[letterService] 편지 추가 오류:', error);
    
    // 오류 발생 시 임시 ID 생성
    const fallbackId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    
    return {
      success: true, // 프론트엔드 호환성을 위해 success: true 유지
      data: {
        id: fallbackId,
        originalContent: letterData.letterContent
      },
      fallback: true,
      message: '데이터베이스 저장 실패, 임시 응답 반환'
    };
  }
}

/**
 * 국가별 편지 통계
 * @returns {Promise<Object>} - 국가별 편지 개수
 */
async function getLetterStats() {
  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');
    
    // 국가별 개수 집계
    const stats = await collection.aggregate([
      { $group: { _id: '$countryId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // 전체 개수 조회
    const total = await collection.countDocuments();
    
    return {
      success: true,
      data: {
        byCountry: stats,
        total
      }
    };
  } catch (error) {
    console.error('[letterService] 편지 통계 조회 오류:', error);
    
    // 샘플 데이터 기반 통계 계산
    const countryMap = {};
    sampleLetters.forEach(letter => {
      countryMap[letter.countryId] = (countryMap[letter.countryId] || 0) + 1;
    });
    
    const sampleStats = Object.entries(countryMap).map(([countryId, count]) => ({
      _id: countryId,
      count
    }));
    
    return {
      success: true,
      data: {
        byCountry: sampleStats,
        total: sampleLetters.length
      },
      fallback: true,
      message: '데이터베이스 연결 실패, 샘플 데이터 기반 통계 반환'
    };
  }
}

module.exports = {
  getLetters,
  getLetterById,
  addLetter,
  getLetterStats
};