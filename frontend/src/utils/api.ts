import axios from 'axios';

// Vercel API 엔드포인트
// 배포 환경과 개발 환경 모두에서 작동하도록 동적 URL 설정
const getApiUrl = () => {
  // 개발 환경에서 테스트할 때 사용할 URL (localhost:5000)
  const devApiUrl = 'http://localhost:5000/api';

  // 프로덕션 환경에서는 현재 호스트의 URL 사용
  // Vercel 배포에서는 상대 경로 사용
  const prodApiUrl = '/api';

  // 개발 환경 여부 확인 (Vite의 환경 변수 사용)
  const isDev = import.meta.env.DEV;

  return isDev ? devApiUrl : prodApiUrl;
};

const API_BASE_URL = getApiUrl();

// 디버깅을 위한 API URL 로깅
console.log('API 베이스 URL:', API_BASE_URL);

// 새 편지 제출
export const submitLetter = async (letterData: {
  name: string;
  email: string;
  school: string;
  grade: string;
  letterContent: string;
  countryId: string;
  originalContent?: boolean;
}) => {
  try {
    console.log('API URL:', `${API_BASE_URL}/letters-test`);
    // 테스트 API 엔드포인트 사용
    const response = await axios.post(`${API_BASE_URL}/letters-test`, letterData);

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('편지 제출 오류:', error);
    return {
      success: false,
      error: error.response?.data?.message || '편지를 제출하지 못했습니다'
    };
  }
};

// 편지 목록 가져오기
export const getLetters = async (countryId?: string) => {
  try {
    // API 엔드포인트 URL 설정 (테스트 API 사용)
    let url = `${API_BASE_URL}/letters-test`;
    if (countryId) {
      url += `?countryId=${countryId}`;
    }

    const response = await axios.get(url);

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('편지 목록 가져오기 오류:', error);
    return {
      success: false,
      error: error.response?.data?.message || '편지 목록을 가져오지 못했습니다'
    };
  }
};

// 특정 ID의 편지 가져오기
export const getLetter = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/letters/${id}`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`ID ${id}의 편지 가져오기 오류:`, error);
    return {
      success: false,
      error: error.response?.data?.message || '편지를 가져오지 못했습니다'
    };
  }
};

// 국가 정보 가져오기
export const getCountries = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/countries`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('국가 목록 가져오기 오류:', error);
    return {
      success: false,
      error: error.response?.data?.message || '국가 목록을 가져오지 못했습니다'
    };
  }
};

// 특정 ID의 국가 정보 가져오기
export const getCountry = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/countries/${id}`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`ID ${id}의 국가 정보 가져오기 오류:`, error);
    return {
      success: false,
      error: error.response?.data?.message || '국가 정보를 가져오지 못했습니다'
    };
  }
};

export default {
  submitLetter,
  getLetters,
  getLetter,
  getCountries,
  getCountry
};