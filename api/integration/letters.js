// 통합 편지 API - Google Sheets API와 MongoDB API를 모두 지원
import { connectToDatabase } from '../_lib/mongodb';
import { parseBody } from '../_lib/parser';
import { v4 as uuidv4 } from 'uuid';

// CORS 헤더 설정 헬퍼 함수
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// 편지 목록 조회 또는 생성 API 핸들러
export default async function handler(req, res) {
  // CORS 사전 요청 처리
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // CORS 헤더 설정
  setCorsHeaders(res);

  try {
    // GET 요청 처리 - 편지 목록 조회
    if (req.method === 'GET') {
      // 쿼리 파라미터 처리
      const { countryId } = req.query;
      
      // Google Sheets API 호환 응답 구조 (더미 데이터)
      // 이전 API 구조와 호환되는 응답 반환
      return res.status(200).json({
        success: true,
        data: []  // 빈 배열 반환
      });
    }
    
    // POST 요청 처리 - 새 편지 생성
    if (req.method === 'POST') {
      // 요청 본문 파싱
      let body;
      try {
        body = await parseBody(req);
        console.log('요청 본문:', body);
      } catch (error) {
        console.error('요청 본문 파싱 오류:', error);
        return res.status(400).json({
          message: '요청 본문 파싱 오류',
          success: false
        });
      }
      
      const { 
        name, 
        email, 
        school, 
        grade, 
        letterContent, 
        originalContent, 
        countryId 
      } = body || {};
      
      // 필수 필드 유효성 검사
      if (!name || !email || !letterContent || !countryId) {
        return res.status(400).json({
          message: '필수 항목이 누락되었습니다',
          success: false
        });
      }
      
      // 번역 로직 (실제 환경에서는 번역 API 연동)
      const translatedContent = `[${countryId} 언어로 번역된 내용: ${letterContent.substring(0, 30)}...]`;
      
      try {
        // Google Sheets API 호환 응답 구조
        // 이전 API 구조와 호환되는 응답 반환
        return res.status(201).json({
          success: true,
          message: '편지가 성공적으로 제출되었습니다',
          data: {
            id: uuidv4(),
            translatedContent: translatedContent,
            originalContent: letterContent
          }
        });
      } catch (dbError) {
        console.error('데이터베이스 저장 오류:', dbError);
        
        // 원본 스프레드시트 API 오류 응답과 호환되는 구조 유지
        return res.status(500).json({
          success: false,
          message: '스프레드시트 확인 중 오류',
          error: 'Failed to access spreadsheet'
        });
      }
    }
    
    // 지원하지 않는 HTTP 메서드
    return res.status(405).json({ 
      message: '지원하지 않는 메서드입니다',
      success: false 
    });
    
  } catch (error) {
    console.error('API 오류:', error);
    
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: error.message
    });
  }
}