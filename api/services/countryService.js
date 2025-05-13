// 국가 서비스 - 참전국 정보 관련 기능 처리
const { connectToDatabase, sampleCountries } = require('../_lib/mongodb');

/**
 * 참전국 목록 조회
 * @param {string} region - 지역(대륙) 필터 (선택적)
 * @param {string} type - 참전 유형 필터 (선택적)
 * @returns {Promise<Object>} - 국가 목록
 */
async function getCountries(region = null, type = null) {
  try {
    console.log('[countryService] getCountries 호출:', { region, type });
    
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('countries');
    
    // 쿼리 조건 설정
    const query = {};
    if (region) query.region = region;
    if (type) query.participationType = type;
    
    // 국가 목록 조회
    const countries = await collection.find(query).toArray();
    console.log(`[countryService] ${countries.length}개 국가 정보 조회 완료`);
    
    return {
      success: true,
      data: countries
    };
  } catch (error) {
    console.error('[countryService] 국가 목록 조회 오류:', error);
    
    // 오류 발생 시 샘플 데이터 반환
    let filteredCountries = [...sampleCountries];
    
    // 필터 적용
    if (region) {
      filteredCountries = filteredCountries.filter(country => country.region === region);
    }
    if (type) {
      filteredCountries = filteredCountries.filter(country => country.participationType === type);
    }
    
    return {
      success: true,
      data: filteredCountries,
      fallback: true,
      message: '데이터베이스 연결 실패, 샘플 데이터 반환'
    };
  }
}

/**
 * 국가 ID로 조회
 * @param {string} id - 국가 ID
 * @returns {Promise<Object>} - 국가 정보
 */
async function getCountryById(id) {
  try {
    console.log('[countryService] getCountryById 호출:', { id });
    
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('countries');
    
    // 국가 조회
    const country = await collection.findOne({ _id: id });
    
    if (!country) {
      return {
        success: false,
        message: '국가 정보를 찾을 수 없습니다.'
      };
    }
    
    return {
      success: true,
      data: country
    };
  } catch (error) {
    console.error('[countryService] 국가 조회 오류:', error);
    
    // 샘플 데이터에서 검색
    const sampleCountry = sampleCountries.find(country => country._id === id);
    
    return {
      success: sampleCountry ? true : false,
      data: sampleCountry || null,
      fallback: true,
      message: sampleCountry ? '샘플 데이터 반환' : '국가 정보를 찾을 수 없습니다.'
    };
  }
}

/**
 * 국가 코드로 조회
 * @param {string} code - 국가 코드
 * @returns {Promise<Object>} - 국가 정보
 */
async function getCountryByCode(code) {
  try {
    console.log('[countryService] getCountryByCode 호출:', { code });
    
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('countries');
    
    // 국가 조회
    const country = await collection.findOne({ code });
    
    if (!country) {
      return {
        success: false,
        message: '국가 정보를 찾을 수 없습니다.'
      };
    }
    
    return {
      success: true,
      data: country
    };
  } catch (error) {
    console.error('[countryService] 국가 조회 오류:', error);
    
    // 샘플 데이터에서 검색
    const sampleCountry = sampleCountries.find(country => country.code === code);
    
    return {
      success: sampleCountry ? true : false,
      data: sampleCountry || null,
      fallback: true,
      message: sampleCountry ? '샘플 데이터 반환' : '국가 정보를 찾을 수 없습니다.'
    };
  }
}

/**
 * 지역(대륙) 목록 조회
 * @returns {Promise<Object>} - 지역 목록
 */
async function getRegions() {
  try {
    // MongoDB 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('countries');
    
    // 고유한 지역 목록 조회
    const regions = await collection.distinct('region');
    
    return {
      success: true,
      data: regions.filter(Boolean).sort() // null/빈 값 제거 및 정렬
    };
  } catch (error) {
    console.error('[countryService] 지역 목록 조회 오류:', error);
    
    // 샘플 데이터에서 고유한 지역 추출
    const sampleRegions = [...new Set(
      sampleCountries
        .map(country => country.region)
        .filter(Boolean) // null/빈 값 제거
    )].sort();
    
    return {
      success: true,
      data: sampleRegions,
      fallback: true,
      message: '데이터베이스 연결 실패, 샘플 데이터 반환'
    };
  }
}

module.exports = {
  getCountries,
  getCountryById,
  getCountryByCode,
  getRegions
};