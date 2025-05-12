import axios from 'axios';

// Vercel API 엔드포인트
// 배포 환경과 개발 환경 모두에서 작동하도록 동적 URL 설정
const getApiUrl = () => {
  // 개발 환경에서 테스트할 때 사용할 URL (localhost:5000)
  const devApiUrl = 'http://localhost:5000/api/letters';
  
  // 프로덕션 환경에서는 현재 호스트의 URL 사용
  const prodApiUrl = `/api/letters`;
  
  // 개발 환경 여부 확인 (Vite의 환경 변수 사용)
  const isDev = import.meta.env.DEV;
  
  return isDev ? devApiUrl : prodApiUrl;
};

const LETTERS_API_URL = getApiUrl();

// 새 편지 제출
export const submitLetterToSheets = async (letterData: {
  name: string;
  email: string;
  school: string;
  grade: string;
  letterContent: string;
  countryId: string;
  originalContent?: boolean;
}) => {
  try {
    console.log('API URL:', LETTERS_API_URL);
    const response = await axios.post(LETTERS_API_URL, letterData);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error submitting letter:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit letter'
    };
  }
};

// 편지 목록 가져오기
export const getLettersFromSheets = async (countryId?: string) => {
  try {
    // API 엔드포인트 URL 설정
    let url = LETTERS_API_URL;
    if (countryId) {
      url += `?countryId=${countryId}`;
    }
    
    const response = await axios.get(url);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching letters:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch letters'
    };
  }
};

// 특정 ID의 편지 가져오기
export const getLetterFromSheets = async (id: string) => {
  try {
    const response = await axios.get(`${LETTERS_API_URL}/${id}`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`Error fetching letter with ID ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch letter'
    };
  }
};