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

// 백엔드 연결 설정
const USE_MOCK_API = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true';

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
      const response = await axios.get<ApiResponse<Survey[]>>('/api/getLetters?type=surveys');
      
      if (!response.data.success) {
        throw new Error(response.data.error || '설문 목록을 불러오는데 실패했습니다.');
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
      const response = await axios.get<ApiResponse<Survey>>(`/api/getSurvey/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || '설문을 불러오는데 실패했습니다.');
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
      const response = await axios.post<ApiResponse<Survey>>('/api/createSurveyDirect', survey);
      
      if (!response.data.success) {
        throw new Error(response.data.error || '설문 생성에 실패했습니다.');
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
        `/api/updateSurvey/${id}`, 
        { ...updates, password }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || '설문 수정에 실패했습니다.');
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
    response: Object
  ): Promise<{ responseId: string }> => {
    if (USE_MOCK_API) {
      return mockSubmitResponse(surveyId, response as any);
    }
    
    try {
      const result = await axios.post<ApiResponse<{ responseId: string }>>(
        '/api/submitSurveyResponse', 
        {
          surveyId,
          responses: response
        }
      );
      
      if (!result.data.success) {
        throw new Error(result.data.error || '응답 제출에 실패했습니다.');
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
      const response = await axios.get<ApiResponse<SurveyResults>>(
        `/api/getSurveyStats/${surveyId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || '결과를 불러오는데 실패했습니다.');
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
        '/api/generateSurvey', 
        request
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'AI 설문 생성에 실패했습니다.');
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
        `/api/verifySurveyPassword/${surveyId}`,
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
        `/api/deleteSurvey/${id}`,
        { data: { password } }
      );
      
      return response.data.success;
    } catch (error) {
      console.error(`Error deleting survey ${id}:`, error);
      return false;
    }
  }
};