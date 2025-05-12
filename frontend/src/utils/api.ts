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
    // 가장 단순한 더미 API 엔드포인트 사용
    console.log('API URL:', `${API_BASE_URL}/submit-test`);

    // 직접 테스트를 위한 보다 명확한 오류 처리와 디버깅
    try {
      const response = await axios.post(`${API_BASE_URL}/submit-test`, letterData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10초 타임아웃
      });

      console.log('API 응답:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (axiosError) {
      // Axios 오류 상세 분석
      console.error('Axios 오류 세부 정보:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        responseData: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          headers: axiosError.config?.headers
        }
      });

      throw axiosError; // 다시 throw하여 외부 catch에서 처리
    }
  } catch (error) {
    console.error('편지 제출 최종 오류:', error);
    return {
      success: false,
      error: error.response?.data?.message || '편지를 제출하지 못했습니다'
    };
  }
};

// 편지 목록 가져오기
export const getLetters = async (countryId?: string) => {
  try {
    // 단순화된 API 엔드포인트 사용
    let url = `${API_BASE_URL}/direct-test`;
    if (countryId) {
      url += `?countryId=${countryId}`;
    }

    console.log('편지 목록 가져오기 URL:', url);

    try {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10초 타임아웃
      });

      console.log('API 응답:', response.data);

      // 실제 데이터가 없으므로 더미 데이터 반환
      return {
        success: true,
        data: [
          {
            id: '1',
            name: '홍길동',
            school: '서울초등학교',
            grade: '5학년',
            letterContent: '감사합니다',
            translatedContent: 'Thank you',
            countryId: 'usa',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: '김철수',
            school: '부산초등학교',
            grade: '6학년',
            letterContent: '고맙습니다',
            translatedContent: 'Thank you very much',
            countryId: 'uk',
            createdAt: new Date().toISOString()
          }
        ]
      };
    } catch (axiosError) {
      console.error('편지 목록 가져오기 Axios 오류:', axiosError);
      throw axiosError;
    }
  } catch (error) {
    console.error('편지 목록 가져오기 최종 오류:', error);
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