import axios from 'axios';

// 테스트용 간단한 API 호출
export const testApi = {
  testSimple: async () => {
    try {
      const response = await axios.get('/api/simple-test');
      console.log('Simple test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Simple test error:', error);
      throw error;
    }
  },
  
  testHealthCheck: async () => {
    try {
      const response = await axios.get('/api/health-check');
      console.log('Health check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },
  
  testSurveysList: async () => {
    try {
      const response = await axios.get('/api/surveys-list');
      console.log('Surveys list response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Surveys list error:', error);
      throw error;
    }
  }
};