const { google } = require('googleapis');

// Google 서비스 계정 인증 정보 (Vercel 환경 변수에서 로드)
function getAuthClient() {
  // 환경 변수 디버깅 로그 (실제 키는 로그에 출력하지 않음)
  console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('Private Key 형식 확인:', typeof process.env.GOOGLE_PRIVATE_KEY, 
              process.env.GOOGLE_PRIVATE_KEY ? 'Key exists' : 'Key is missing');
  console.log('Spreadsheet ID:', process.env.GOOGLE_SPREADSHEET_ID);
  
  // private_key 처리
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey && !privateKey.includes('\\n') && !privateKey.includes('\n')) {
    // 줄바꿈이 포함되지 않은 경우 JSON에서 직접 가져왔을 가능성이 높음
    privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n')
                          .replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----\n')
                          .replace(/(.{64})/g, '$1\n');
  } else if (privateKey) {
    // 일반적인 줄바꿈 처리
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  try {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey
    };

    return new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  } catch (error) {
    console.error('인증 클라이언트 생성 오류:', error);
    throw error;
  }
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
    console.log('addLetter 함수 실행 시작');
    
    // 스프레드시트 ID 확인
    if (!SPREADSHEET_ID) {
      console.error('스프레드시트 ID가 설정되지 않았습니다.');
      return {
        success: false,
        error: 'Spreadsheet ID is not configured'
      };
    }
    
    console.log('Google Sheets API 클라이언트 가져오기');
    const sheets = await getSheetsClient();
    
    // 스프레드시트 존재 여부 확인 
    try {
      console.log('스프레드시트 존재 여부 확인');
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
      });
      console.log('스프레드시트 제목:', spreadsheet.data.properties.title);
      
      // letters 시트 존재 여부 확인
      let sheetExists = false;
      for (const sheet of spreadsheet.data.sheets) {
        if (sheet.properties.title === LETTERS_SHEET) {
          sheetExists = true;
          break;
        }
      }
      
      // letters 시트가 없으면 생성
      if (!sheetExists) {
        console.log('letters 시트가 없어 새로 생성합니다.');
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: LETTERS_SHEET
                  }
                }
              }
            ]
          }
        });
        
        // 헤더 추가
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${LETTERS_SHEET}!A1:I1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [['id', 'name', 'email', 'school', 'grade', 'letterContent', 'translatedContent', 'countryId', 'createdAt']]
          }
        });
      }
    } catch (error) {
      console.error('스프레드시트 확인 중 오류:', error);
      return {
        success: false,
        error: 'Failed to access spreadsheet',
        details: error.message
      };
    }
    
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
    
    console.log('스프레드시트에 데이터 추가 시작');
    // 스프레드시트에 데이터 추가
    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${LETTERS_SHEET}!A:I`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });
    
    console.log('스프레드시트 데이터 추가 완료:', appendResult.data.updates.updatedRange);
    
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
    console.error('편지 추가 중 오류:', error);
    return {
      success: false,
      error: 'Failed to add letter to spreadsheet',
      message: error.message,
      details: error.response?.data?.error || 'Unknown error'
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