/**
 * 편지 삭제 API 엔드포인트
 * 관리자 비밀번호를 통해 편지를 삭제합니다.
 */

const { MongoClient, ObjectId } = require('mongodb');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  console.log('[deleteLetter] API 호출:', req.method, req.url);
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: '허용되지 않은 메서드'
    });
  }
  
  try {
    // URL에서 편지 ID 추출
    const path = req.url.split('?')[0];
    console.log('[deleteLetter] 원본 경로:', path);
    
    let letterId = '';
    
    // URL 경로에서 ID 추출
    if (path.includes('/deleteLetter/')) {
      const parts = path.split('/');
      letterId = parts[parts.length - 1];
    }
    
    console.log(`[deleteLetter] 추출된 편지 ID: "${letterId}"`);
    
    if (!letterId) {
      return res.status(400).json({
        success: false,
        error: '편지 ID가 필요합니다.'
      });
    }
    
    // 요청 본문에서 비밀번호 가져오기
    const { password } = req.body || {};
    console.log('[deleteLetter] 비밀번호 제공 여부:', !!password);
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: '비밀번호가 필요합니다.'
      });
    }
    
    // 하드코딩된 관리자 비밀번호 확인
    const isAdmin = password === '19500625';
    
    if (!isAdmin) {
      console.log('[deleteLetter] 일반 사용자 - 편지 비밀번호 필요');
      // 일반 사용자인 경우 편지 비밀번호 확인 필요
      // 이 부분은 추후 구현
      return res.status(401).json({
        success: false,
        error: '관리자 비밀번호가 필요합니다.'
      });
    }
    
    console.log('[deleteLetter] 관리자 확인 완료 - 강제 삭제 권한 부여');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.MONGODB_DB_NAME || 'unthanks-db';
    
    let client = null;
    
    try {
      console.log('[deleteLetter] MongoDB 연결 시도');
      client = await MongoClient.connect(MONGODB_URI);
      console.log('[deleteLetter] MongoDB 연결 성공');
      
      const db = client.db(DB_NAME);
      const lettersCollection = db.collection('letters');
      
      // 편지가 존재하는지 확인
      let letter;
      
      try {
        // ObjectId로 조회 시도
        const objectId = new ObjectId(letterId);
        letter = await lettersCollection.findOne({ _id: objectId });
      } catch (e) {
        console.log('[deleteLetter] ObjectId 변환 실패, 문자열 ID로 시도:', e.message);
        // 문자열 ID로 조회 시도
        letter = await lettersCollection.findOne({ _id: letterId });
      }
      
      if (!letter) {
        return res.status(404).json({
          success: false,
          error: '해당 편지를 찾을 수 없습니다.'
        });
      }
      
      console.log('[deleteLetter] 편지 찾음:', letter.title || '제목 없음');
      
      // 편지 삭제
      let deleteResult;
      
      try {
        // ObjectId로 삭제 시도
        const objectId = new ObjectId(letterId);
        deleteResult = await lettersCollection.deleteOne({ _id: objectId });
      } catch (e) {
        // 문자열 ID로 삭제 시도
        deleteResult = await lettersCollection.deleteOne({ _id: letterId });
      }
      
      console.log('[deleteLetter] 편지 삭제 결과:', deleteResult.deletedCount);
      
      return res.status(200).json({
        success: true,
        message: '편지가 성공적으로 삭제되었습니다.',
        deletedCount: deleteResult.deletedCount
      });
      
    } finally {
      if (client) {
        await client.close();
        console.log('[deleteLetter] MongoDB 연결 종료');
      }
    }
    
  } catch (error) {
    console.error('[deleteLetter] 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 내부 오류',
      message: error.message
    });
  }
};