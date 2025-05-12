// 특정 ID의 편지 조회 API
import { connectToDatabase } from '../_lib/mongodb';

// CORS 헤더 설정 헬퍼 함수
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

// 특정 ID의 편지 조회 API 핸들러
export default async function handler(req, res) {
  // CORS 사전 요청 처리
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).end();
  }
  
  // CORS 헤더 설정
  setCorsHeaders(res);
  
  // ID 파라미터 추출
  const { id } = req.query;
  
  // GET 메서드만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      message: '지원하지 않는 메서드입니다',
      success: false 
    });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('letters');
    
    // ID로 편지 조회
    const letter = await collection.findOne({ _id: id });
    
    // 편지가 없는 경우
    if (!letter) {
      return res.status(404).json({
        message: '편지를 찾을 수 없습니다',
        success: false
      });
    }
    
    // 개인정보 제거하여 반환
    const sanitizedLetter = {
      id: letter._id,
      name: letter.name,
      school: letter.school,
      grade: letter.grade,
      letterContent: letter.letterContent,
      translatedContent: letter.translatedContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt
    };
    
    return res.status(200).json({
      success: true,
      data: sanitizedLetter
    });
    
  } catch (error) {
    console.error(`ID ${id}의 편지 조회 오류:`, error);
    return res.status(500).json({
      message: '서버 오류가 발생했습니다',
      success: false
    });
  }
}