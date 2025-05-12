import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

// 구글 API 인증 정보 (환경 변수에서 로드)
const CREDENTIALS = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// 스프레드시트 ID (환경 변수에서 로드)
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// 시트 이름
const LETTERS_SHEET_NAME = 'letters';

// 인증된 클라이언트 생성
const getAuthClient = (): JWT => {
  return new JWT({
    email: CREDENTIALS.client_email,
    key: CREDENTIALS.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// Sheets API 인스턴스 생성
const getSheetsClient = async (): Promise<sheets_v4.Sheets> => {
  const authClient = getAuthClient();
  return google.sheets({ version: 'v4', auth: authClient });
};

// 시트 초기화 (첫 사용 시 헤더 설정)
export const initializeSheets = async (): Promise<void> => {
  try {
    const sheets = await getSheetsClient();
    
    // 시트가 있는지 확인
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    let letterSheetExists = false;
    
    // 시트 목록에서 letters 시트가 있는지 확인
    if (response.data.sheets) {
      for (const sheet of response.data.sheets) {
        if (sheet.properties?.title === LETTERS_SHEET_NAME) {
          letterSheetExists = true;
          break;
        }
      }
    }
    
    // 시트가 없다면 생성
    if (!letterSheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: LETTERS_SHEET_NAME,
                },
              },
            },
          ],
        },
      });
      
      // 헤더 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${LETTERS_SHEET_NAME}!A1:J1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['id', 'name', 'email', 'school', 'grade', 'letterContent', 'translatedContent', 'originalContent', 'countryId', 'createdAt']],
        },
      });
    }
    
    console.log('Google Sheets initialized successfully');
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw error;
  }
};

// 편지 추가
export const addLetter = async (letter: any): Promise<void> => {
  try {
    const sheets = await getSheetsClient();
    
    // 편지 데이터를 행으로 변환
    const row = [
      letter.id,
      letter.name,
      letter.email,
      letter.school || '',
      letter.grade || '',
      letter.letterContent,
      letter.translatedContent,
      letter.originalContent ? 'true' : 'false',
      letter.countryId,
      letter.createdAt.toISOString(),
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${LETTERS_SHEET_NAME}!A:J`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });
    
    console.log(`Letter added to Google Sheets with ID: ${letter.id}`);
  } catch (error) {
    console.error('Error adding letter to Google Sheets:', error);
    throw error;
  }
};

// 편지 목록 가져오기
export const getLetters = async (countryId?: string): Promise<any[]> => {
  try {
    const sheets = await getSheetsClient();
    
    // 스프레드시트에서 데이터 가져오기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${LETTERS_SHEET_NAME}!A:J`,
    });
    
    const rows = response.data.values || [];
    
    // 헤더 행 제외
    if (rows.length <= 1) {
      return [];
    }
    
    const headers = rows[0];
    const letters = [];
    
    // 행을 편지 객체로 변환
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // 충분한 데이터가 있는지 확인
      if (row.length < 9) continue;
      
      const letter: any = {
        id: row[0],
        name: row[1],
        email: row[2],
        school: row[3],
        grade: row[4],
        letterContent: row[5],
        translatedContent: row[6],
        originalContent: row[7] === 'true',
        countryId: row[8],
        createdAt: row[9],
      };
      
      // countryId가 제공된 경우 필터링
      if (!countryId || letter.countryId === countryId) {
        letters.push(letter);
      }
    }
    
    // 최신순으로 정렬 (ISO 형식의 날짜 문자열을 기준으로)
    letters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return letters;
  } catch (error) {
    console.error('Error getting letters from Google Sheets:', error);
    throw error;
  }
};

// 특정 ID의 편지 가져오기
export const getLetter = async (id: string): Promise<any | null> => {
  try {
    const letters = await getLetters();
    return letters.find(letter => letter.id === id) || null;
  } catch (error) {
    console.error(`Error getting letter with ID ${id} from Google Sheets:`, error);
    throw error;
  }
};

export default {
  initializeSheets,
  addLetter,
  getLetters,
  getLetter,
};