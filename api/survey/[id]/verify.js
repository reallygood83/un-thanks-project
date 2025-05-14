// 설문 비밀번호 검증 API
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('../../_lib/mongodb');

/**
 * 설문 비밀번호 검증 API 핸들러
 */
module.exports = async (req, res) => {
  // URL에서 ID 파라미터 추출
  const surveyId = req.query.id;
  
  console.log(`[설문 비밀번호 검증 API] ${req.method} /api/survey/${surveyId}/verify`);
  
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ID 유효성 검증
  if (!surveyId) {
    return res.status(400).json({
      success: false,
      message: 'Survey ID is required'
    });
  }
  
  try {
    // MongoDB ID 형식 확인 및 변환
    let objectId;
    try {
      objectId = new ObjectId(surveyId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid survey ID format'
      });
    }
    
    // 데이터베이스 연결
    const { db } = await connectToDatabase();
    
    // POST 요청 - 비밀번호 검증
    if (req.method === 'POST') {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }
      
      // 설문 조회
      const survey = await db.collection('surveys').findOne({ _id: objectId });
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }
      
      // 비밀번호 검증
      const isValid = await bcrypt.compare(password, survey.creationPassword);
      
      return res.status(200).json({
        success: isValid,
        message: isValid ? 'Password verified' : 'Invalid password'
      });
    }
    
    // 다른 메소드는 허용하지 않음
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
    
  } catch (error) {
    console.error(`[설문 비밀번호 검증 API] 오류 (SurveyID: ${surveyId}):`, error);
    
    // 클라이언트에게 오류 응답
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};