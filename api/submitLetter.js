// 편지 제출 API 핸들러 - MongoDB 연동
const { connectToDatabase } = require('./_lib/mongodb');
const { parseBody } = require('./_lib/parser');
const { v4: uuidv4 } = require('uuid');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// 편지 제출 API 핸들러
module.exports = async function handler(req, res) {
  try {
    // CORS 헤더 설정
    setCorsHeaders(res);

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // POST 요청이 아니면 405 오류 반환
    if (req.method !== 'POST') {
      console.error('허용되지 않은 메서드:', req.method);
      return res.status(405).json({
        success: false,
        message: '허용되지 않은 HTTP 메서드입니다. POST 요청만 허용됩니다.'
      });
    }

    console.log('submitLetter API 호출됨 - MongoDB 연동 버전');

    try {
      // MongoDB 연결
      const { db } = await connectToDatabase();
      const collection = db.collection('letters');

      // 요청 본문 파싱
      const body = await parseBody(req);
      console.log('파싱된 요청 본문:', {
        hasName: !!body.name,
        hasEmail: !!body.email,
        contentLength: body.letterContent ? body.letterContent.length : 0,
        countryId: body.countryId
      });

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
          success: false,
          message: '필수 항목이 누락되었습니다.'
        });
      }

      // 번역 로직 (간단한 구현)
      const translatedContent = `[${countryId} 언어로 번역된 내용]: ${letterContent.substring(0, 30)}...`;

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
      console.log('MongoDB 저장 결과:', {
        acknowledged: result.acknowledged,
        id: newLetter._id
      });

      // 성공 응답 반환
      return res.status(201).json({
        success: true,
        message: '편지가 성공적으로 제출되었습니다',
        data: {
          id: newLetter._id,
          translatedContent,
          originalContent: letterContent
        }
      });
    } catch (dbError) {
      console.error('MongoDB 오류:', dbError);
      
      // 개발 환경에서 임시 데이터 반환
      const fallbackId = 'fallback-' + Date.now();
      console.log('임시 더미 데이터 반환, ID:', fallbackId);
      
      return res.status(200).json({
        success: true,
        message: 'MongoDB 연결 실패로 임시 데이터 반환',
        data: {
          id: fallbackId,
          translatedContent: `[임시 번역]: ${letterContent ? letterContent.substring(0, 30) : ''}...`,
          originalContent: letterContent || ''
        },
        fallback: true
      });
    }
  } catch (error) {
    console.error('submitLetter API 처리 중 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다: ' + error.message
    });
  }
};