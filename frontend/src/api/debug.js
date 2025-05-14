import axios from 'axios';

// API 기본 URL
const BASE_URL = '/api';

// 디버깅을 위한 API 클라이언트
export const debugApi = {
  /**
   * 디버그 API 호출
   * @returns 디버그 정보
   */
  debugRequest: async () => {
    try {
      // 현재 환경 정보
      console.log('현재 환경:', import.meta.env.MODE);
      console.log('API URL 기본 경로:', BASE_URL);
      
      // 디버그 API 호출
      const response = await axios.get(`${BASE_URL}/debug-surveys`);
      return response.data;
    } catch (error) {
      console.error('디버그 요청 오류:', error);
      throw error;
    }
  },
  
  /**
   * 새로운 단일 API 엔드포인트 테스트
   * @returns 설문 목록
   */
  testSurveysApi: async () => {
    try {
      console.log('API 테스트 URL:', `${BASE_URL}/surveys-api`);
      const response = await axios.get(`${BASE_URL}/surveys-api`);
      return response.data;
    } catch (error) {
      console.error('surveys-api 테스트 오류:', error);
      throw error;
    }
  }
};