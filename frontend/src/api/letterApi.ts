import axios from 'axios';
import { Letter, LetterSubmission, ApiResponse } from '../types/letter';

// API 베이스 URL 설정
const getApiUrl = () => {
  const isDev = import.meta.env.DEV;
  const devApiUrl = 'http://localhost:3001';
  const prodApiUrl = '';
  return isDev ? devApiUrl : prodApiUrl;
};

axios.defaults.baseURL = getApiUrl();

export const letterApi = {
  /**
   * 모든 편지 목록을 조회합니다.
   */
  getAllLetters: async (): Promise<Letter[]> => {
    try {
      const response = await axios.get<ApiResponse<Letter[]>>('/api/get-letters');
      
      if (response.data.success) {
        return response.data.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching letters:', error);
      return [];
    }
  },

  /**
   * 특정 편지를 조회합니다.
   */
  getLetter: async (id: string): Promise<Letter | null> => {
    try {
      const response = await axios.get<ApiResponse<Letter>>(`/api/letters/${id}`);
      
      if (response.data.success) {
        return response.data.data || null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching letter ${id}:`, error);
      return null;
    }
  },

  /**
   * 새로운 편지를 제출합니다.
   */
  submitLetter: async (letter: LetterSubmission): Promise<{ letterId: string } | null> => {
    try {
      const response = await axios.post<ApiResponse<{ letterId: string }>>('/api/submit-letter', letter);
      
      if (response.data.success) {
        return response.data.data || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error submitting letter:', error);
      return null;
    }
  },

  /**
   * 편지를 삭제합니다.
   */
  deleteLetter: async (id: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.delete<ApiResponse<void>>(
        `/api/deleteLetter/${id}`,
        { data: { password } }
      );
      
      return response.data.success;
    } catch (error) {
      console.error(`Error deleting letter ${id}:`, error);
      return false;
    }
  }
};