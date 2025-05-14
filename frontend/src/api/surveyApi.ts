import axios from 'axios';
import { 
  Survey, 
  SurveyResponse, 
  SurveyResults, 
  ApiResponse,
  GenerateSurveyRequest
} from '../types/survey';
import { 
  mockGetAllSurveys,
  mockGetSurveyById,
  mockSubmitResponse,
  mockGetSurveyResults
} from './mockSurveyData';

// API 기본 URL
const BASE_URL = '/api/surveys';

// 디버그용 - 새로운 통합 API 엔드포인트
const USE_NEW_API = import.meta.env.DEV && import.meta.env.VITE_USE_NEW_API === 'true';
const SURVEYS_API_URL = '/api/surveys-api';

// 백엔드 연결 설정 (임시로 항상 목업 API 사용)
const USE_MOCK_API = true; // 서버 연결 시: import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true'

/**
 * 미래로 AI 설문 서비스를 위한 API 클라이언트
 */
export const surveyApi = {
  /**
   * 활성화된 모든 설문 목록을 조회합니다.
   * 
   * @returns 설문 목록
   */
  getAllSurveys: async (): Promise<Survey[]> => {
    if (USE_MOCK_API) {
      return mockGetAllSurveys();
    }
    
    try {
      // 디버그 로그 추가
      console.log('API URL 설정:', { BASE_URL, SURVEYS_API_URL, USE_NEW_API });
      
      // 새로운 API와 기존 API 둘 다 시도
      let response;
      try {
        const url = USE_NEW_API ? SURVEYS_API_URL : BASE_URL;
        console.log('설문 조회 API URL:', url);
        response = await axios.get<ApiResponse<Survey[]>>(url);
      } catch (err) {
        console.log('기본 API 실패, 대체 API 시도');
        // 첫 번째 시도가 실패하면 다른 엔드포인트 시도
        response = await axios.get<ApiResponse<Survey[]>>(USE_NEW_API ? BASE_URL : SURVEYS_API_URL);
      }
      
      if (!response.data.success) {
        throw new Error(response.data.message || '설문 목록을 불러오는데 실패했습니다.');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching surveys:', error);
      throw error;
    }
  },
  
  /**
   * 특정 ID의 설문을 조회합니다.
   * 
   * @param id 설문 ID
   * @returns 설문 정보
   */
  getSurveyById: async (id: string): Promise<Survey> => {
    if (USE_MOCK_API) {
      return mockGetSurveyById(id);
    }
    
    try {
      const response = await axios.get<ApiResponse<Survey>>(`${BASE_URL}/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || '설문을 불러오는데 실패했습니다.');
      }
      
      return response.data.data as Survey;
    } catch (error) {
      console.error(`Error fetching survey ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * 새로운 설문을 생성합니다.
   * 
   * @param survey 생성할 설문 정보
   * @returns 생성된 설문 정보
   */
  createSurvey: async (survey: Omit<Survey, '_id' | 'createdAt' | 'updatedAt'>): Promise<Survey> => {
    try {
      const response = await axios.post<ApiResponse<Survey>>(BASE_URL, survey);
      
      if (!response.data.success) {
        throw new Error(response.data.message || '설문 생성에 실패했습니다.');
      }
      
      return response.data.data as Survey;
    } catch (error) {
      console.error('Error creating survey:', error);
      throw error;
    }
  },
  
  /**
   * 설문을 수정합니다. 관리자 비밀번호가 필요합니다.
   * 
   * @param id 설문 ID
   * @param updates 수정할 내용
   * @param password 관리자 비밀번호
   * @returns 수정된 설문 정보
   */
  updateSurvey: async (
    id: string, 
    updates: Partial<Omit<Survey, '_id' | 'createdAt' | 'updatedAt' | 'creationPassword'>>,
    password: string
  ): Promise<Survey> => {
    try {
      const response = await axios.put<ApiResponse<Survey>>(
        `${BASE_URL}/${id}`, 
        { ...updates, password }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || '설문 수정에 실패했습니다.');
      }
      
      return response.data.data as Survey;
    } catch (error) {
      console.error(`Error updating survey ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * 설문 응답을 제출합니다.
   * 
   * @param surveyId 설문 ID
   * @param response 제출할 응답 데이터
   * @returns 응답 ID를 포함한 결과
   */
  submitResponse: async (
    surveyId: string, 
    response: Omit<SurveyResponse, '_id' | 'surveyId' | 'createdAt'>
  ): Promise<{ responseId: string }> => {
    if (USE_MOCK_API) {
      return mockSubmitResponse(surveyId, response);
    }
    
    try {
      const result = await axios.post<ApiResponse<{ responseId: string }>>(
        `${BASE_URL}/${surveyId}/responses`, 
        response
      );
      
      if (!result.data.success) {
        throw new Error(result.data.message || '응답 제출에 실패했습니다.');
      }
      
      return result.data.data as { responseId: string };
    } catch (error) {
      console.error(`Error submitting response to survey ${surveyId}:`, error);
      throw error;
    }
  },
  
  /**
   * 설문 결과를 조회합니다.
   * 비밀번호를 제공하면 상세 정보를 조회할 수 있습니다.
   * 
   * @param surveyId 설문 ID
   * @param password 관리자 비밀번호 (선택적)
   * @returns 설문 결과 정보
   */
  getSurveyResults: async (surveyId: string, password?: string): Promise<SurveyResults> => {
    if (USE_MOCK_API) {
      return mockGetSurveyResults(surveyId);
    }
    
    try {
      const params: any = {};
      if (password) {
        params.password = password;
      }
      
      const response = await axios.get<ApiResponse<SurveyResults>>(
        `${BASE_URL}/${surveyId}/results`,
        { params }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || '결과를 불러오는데 실패했습니다.');
      }
      
      return response.data.data as SurveyResults;
    } catch (error) {
      console.error(`Error fetching survey results for ${surveyId}:`, error);
      throw error;
    }
  },
  
  /**
   * AI를 이용해 새로운 설문을 생성합니다.
   * 
   * @param prompt 설문 생성을 위한 프롬프트
   * @returns AI가 생성한 설문 정보
   */
  generateSurveyWithAI: async (prompt: string): Promise<Survey> => {
    try {
      const request: GenerateSurveyRequest = { prompt };
      const response = await axios.post<ApiResponse<Survey>>(
        `${BASE_URL}/generate`, 
        request
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'AI 설문 생성에 실패했습니다.');
      }
      
      return response.data.data as Survey;
    } catch (error) {
      console.error('Error generating survey with AI:', error);
      throw error;
    }
  },
  
  /**
   * 관리자 비밀번호를 확인합니다.
   * 
   * @param surveyId 설문 ID
   * @param password 확인할 비밀번호
   * @returns 비밀번호 유효 여부
   */
  verifyPassword: async (surveyId: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post<ApiResponse<boolean>>(
        `${BASE_URL}/${surveyId}/verify`,
        { password }
      );
      
      return response.data.success;
    } catch (error) {
      console.error(`Error verifying password for survey ${surveyId}:`, error);
      return false;
    }
  },
  
  /**
   * 설문을 삭제합니다. 관리자 비밀번호가 필요합니다.
   * 
   * @param id 설문 ID
   * @param password 관리자 비밀번호
   * @returns 성공 여부
   */
  deleteSurvey: async (id: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.delete<ApiResponse<void>>(
        `${BASE_URL}/${id}`,
        { data: { password } }
      );
      
      return response.data.success;
    } catch (error) {
      console.error(`Error deleting survey ${id}:`, error);
      return false;
    }
  }
};