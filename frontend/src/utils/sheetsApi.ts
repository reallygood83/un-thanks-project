import axios from 'axios';

// 구글 Apps Script 웹 앱 URL (배포 후 실제 URL로 변경 필요)
const SHEETS_API_URL = 'https://script.google.com/macros/s/your-deployment-id/exec';

// 새 편지 제출
export const submitLetterToSheets = async (letterData: {
  name: string;
  email: string;
  school: string;
  grade: string;
  letterContent: string;
  countryId: string;
}) => {
  try {
    const response = await axios.post(SHEETS_API_URL, {
      action: 'addLetter',
      letter: letterData
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error submitting letter to Google Sheets:', error);
    return {
      success: false,
      error: 'Failed to submit letter'
    };
  }
};

// 편지 목록 가져오기
export const getLettersFromSheets = async (countryId?: string) => {
  try {
    // GET 요청 사용
    const url = new URL(SHEETS_API_URL);
    url.searchParams.append('action', 'getLetters');
    if (countryId) {
      url.searchParams.append('countryId', countryId);
    }
    
    const response = await axios.get(url.toString());
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching letters from Google Sheets:', error);
    return {
      success: false,
      error: 'Failed to fetch letters'
    };
  }
};

// 특정 ID의 편지 가져오기
export const getLetterFromSheets = async (id: string) => {
  try {
    const url = new URL(SHEETS_API_URL);
    url.searchParams.append('action', 'getLetter');
    url.searchParams.append('id', id);
    
    const response = await axios.get(url.toString());
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error(`Error fetching letter with ID ${id} from Google Sheets:`, error);
    return {
      success: false,
      error: 'Failed to fetch letter'
    };
  }
};