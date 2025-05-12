const { google } = require('googleapis');

// Google 서비스 계정 인증 정보 (Vercel 환경 변수에서 로드)
function getAuthClient() {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  };

  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

// Google Sheets API 클라이언트 생성
async function getSheetsClient() {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

// 스프레드시트 ID
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const LETTERS_SHEET = 'letters'; // 편지 데이터가 저장된 시트 이름

// 편지 추가
async function addLetter(letter) {
  try {
    const sheets = await getSheetsClient();
    
    // 현재 날짜와 ID 생성
    const id = require('crypto').randomUUID();
    const createdAt = new Date().toISOString();
    
    // 모의 번역 (실제 서비스에서는 번역 API 연동)
    const translatedContent = `[Translated version of: ${letter.letterContent}]`;
    
    // 행 데이터 생성
    const rowData = [
      id,
      letter.name,
      letter.email,
      letter.school || '',
      letter.grade || '',
      letter.letterContent,
      translatedContent,
      letter.countryId,
      createdAt
    ];
    
    // 스프레드시트에 데이터 추가
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${LETTERS_SHEET}!A:I`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });
    
    return {
      success: true,
      data: {
        id,
        translatedContent,
        originalContent: letter.letterContent,
        createdAt
      }
    };
  } catch (error) {
    console.error('Error adding letter:', error);
    return {
      success: false,
      error: 'Failed to add letter to spreadsheet'
    };
  }
}

// 편지 목록 조회
async function getLetters(countryId) {
  try {
    const sheets = await getSheetsClient();
    
    // 스프레드시트에서 데이터 가져오기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${LETTERS_SHEET}!A:I`
    });
    
    const rows = response.data.values || [];
    
    // 데이터가 없거나 헤더만 있는 경우
    if (rows.length <= 1) {
      return { success: true, data: [] };
    }
    
    // 헤더 행을 제외한 데이터 처리
    let letters = rows.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      // 이메일은 개인정보로 제외
      school: row[3] || '',
      grade: row[4] || '',
      letterContent: row[5] || '',
      translatedContent: row[6] || '',
      countryId: row[7] || '',
      createdAt: row[8] || new Date().toISOString()
    }));
    
    // 국가별 필터링
    if (countryId) {
      letters = letters.filter(letter => letter.countryId === countryId);
    }
    
    // 날짜 기준 내림차순 정렬 (최신순)
    letters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return { success: true, data: letters };
  } catch (error) {
    console.error('Error fetching letters:', error);
    return {
      success: false,
      error: 'Failed to fetch letters from spreadsheet'
    };
  }
}

// 특정 ID의 편지 조회
async function getLetter(id) {
  try {
    const { data: letters } = await getLetters();
    const letter = letters.find(letter => letter.id === id);
    
    if (!letter) {
      return {
        success: false,
        error: 'Letter not found'
      };
    }
    
    return { success: true, data: letter };
  } catch (error) {
    console.error('Error fetching letter:', error);
    return {
      success: false,
      error: 'Failed to fetch letter from spreadsheet'
    };
  }
}

module.exports = {
  addLetter,
  getLetters,
  getLetter
};