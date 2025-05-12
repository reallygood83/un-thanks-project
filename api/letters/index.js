// 편지 API 엔드포인트 (GET, POST)
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
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');

    // GET 요청 처리 - 편지 목록 조회
    if (req.method === 'GET') {
      // 쿼리 파라미터 처리
      const { countryId } = req.query;
      
      // 쿼리 조건 설정
      const query = countryId ? { countryId } : {};
      
      // 편지 목록 조회 (최신순)
      const letters = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      
      // 개인정보 제거하여 반환
      const sanitizedLetters = letters.map(letter => ({
        id: letter._id,
        name: letter.name,
        school: letter.school,
        grade: letter.grade,
        letterContent: letter.letterContent,
        translatedContent: letter.translatedContent,
        countryId: letter.countryId,
        createdAt: letter.createdAt
      }));

      return res.status(200).json({
        success: true,
        data: sanitizedLetters
      });
    }
    
    // POST 요청 처리 - 새 편지 생성
    if (req.method === 'POST') {
      // 요청 본문 파싱
      let body;
      try {
        body = await parseBody(req);
        console.log('Parsed request body:', body);
      } catch (error) {
        console.error('Body parsing error:', error);
        return res.status(400).json({
          message: '요청 본문 파싱 오류: ' + error.message,
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
      } = body;
      
      // 필수 필드 유효성 검사
      if (!name || !email || !letterContent || !countryId) {
        return res.status(400).json({
          message: '필수 항목이 누락되었습니다',
          success: false
        });
      }
      
      // 번역 로직 (실제 환경에서는 번역 API 연동)
      // TODO: 실제 번역 API 구현
      const translatedContent = `[${countryId} 언어로 번역된 내용: ${letterContent.substring(0, 30)}...]`;
      
      // 새 편지 문서 생성
      const newLetter = {
        _id: uuidv4(),
        name,
        email,
        school: school || '',
        grade: grade || '',
        letterContent,
        translatedContent,
        originalContent: !!originalContent,
        countryId,
        createdAt: new Date()
      };
      
      // 데이터베이스에 저장
      const result = await collection.insertOne(newLetter);
      console.log('Insert result:', result);
      
      // 성공 응답 반환
      return res.status(201).json({
        message: '편지가 성공적으로 제출되었습니다',
        success: true,
        data: {
          id: newLetter._id,
          translatedContent,
          originalContent: letterContent
        }
      });
    }
    
    // 지원하지 않는 HTTP 메서드
    return res.status(405).json({ 
      message: '지원하지 않는 메서드입니다',
      success: false 
    });
    
  } catch (error) {
    console.error('편지 API 오류:', error);
    return res.status(500).json({
      message: '서버 오류가 발생했습니다: ' + error.message,
      success: false
    });
  }
}