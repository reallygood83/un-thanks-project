import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const getCountries = async () => {
  const response = await api.get('/countries');
  return response.data;
};

export const getCountry = async (id: string) => {
  const response = await api.get(`/countries/${id}`);
  return response.data;
};

export const submitLetter = async (letterData: {
  name: string;
  email: string;
  school: string;
  grade: string;
  letterContent: string;
  originalContent: boolean;
  countryId: string;
}) => {
  const response = await api.post('/letters', letterData);
  return response.data;
};

export default api;