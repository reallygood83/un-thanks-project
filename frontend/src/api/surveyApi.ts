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

// 개발 환경에서는 프론트엔드 :3000에서 백엔드 :3001로 요청
// 프로덕션 환경에서는 같은 도메인으로 요청
const getApiUrl = () => {
  const isDev = import.meta.env.DEV;
  const devApiUrl = 'http://localhost:3001';
  const prodApiUrl = '';
  return isDev ? devApiUrl : prodApiUrl;
};

// 전역 axios 설정
axios.defaults.baseURL = getApiUrl();
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// 백엔드 연결 설정
const USE_MOCK_API = false; // 실제 MongoDB 사용

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
      const response = await axios.get('/api/get-letters?type=surveys');
      
      // HTML이 반환된 경우를 체크
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.log('API가 HTML 응답 반환 - 빈 배열 반환');
        return [];
      }
      
      // API 응답이 성공적인 경우
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      
      // 응답은 있지만 success가 false인 경우
      if (response.data && response.data.success === false) {
        console.log('API 응답 실패:', response.data.error);
        return [];
      }
      
      // 기타 예상치 못한 형식
      console.log('예상치 못한 API 응답 형식:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching surveys:', error);
      // 에러 발생시 빈 배열 반환 (앱이 크래시되지 않도록)
      return [];
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
    if (USE_MOCK_API) {
      // 목 데이터로 설문 생성 시뮬레이션
      return new Promise((resolve) => {
        setTimeout(() => {
          const newSurvey: Survey = {
            _id: `mock_${Date.now()}`,
            ...survey,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          console.log('Mock 설문 생성:', newSurvey);
          resolve(newSurvey);
        }, 1000);
      });
    }
    
    try {
      // submitLetter API 사용, type: 'survey' 추가
      const surveyData = {
        ...survey,
        type: 'survey'
      };
      
      console.log('설문 생성 요청 데이터:', surveyData);
      console.log('JSON 변환:', JSON.stringify(surveyData));
      
      // 기본 API 사용
      const response = await axios.post<ApiResponse<Survey>>('/api/submit-letter', surveyData);
      
      console.log('설문 생성 응답:', response);
      
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
      const submitData = {
        surveyId,
        responses: response
      };
      
      console.log('[surveyApi] 제출할 설문 응답:', JSON.stringify(submitData));
      
      const result = await axios.post<ApiResponse<{ responseId: string }>>(
        '/api/submitSurveyResponse', 
        submitData
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
      const url = `/api/getSurveyStats/${surveyId}`;
      const params = password ? { password } : {};
      
      const response = await axios.get<ApiResponse<SurveyResults>>(url, { params });
      
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
      
      // 새로 만든 Gemini API 엔드포인트 사용
      const response = await axios.post<ApiResponse<any>>(
        '/api/generate-survey', 
        request
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'AI 설문 생성에 실패했습니다.');
      }
      
      // 반환된 JSON 데이터 처리
      const surveyData = response.data.data;
      
      // 형식 변환 (필요한 경우)
      const questions = surveyData.questions.map((q: any, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        text: q.question,
        type: q.type === 'single' ? 'singleChoice' : 
              q.type === 'multiple' ? 'multipleChoice' : 'text',
        options: q.options || [],
        required: q.required || true
      }));
      
      return {
        title: surveyData.title,
        description: surveyData.description,
        questions: questions,
        isActive: true
      };
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