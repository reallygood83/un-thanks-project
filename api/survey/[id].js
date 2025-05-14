// 설문 API - 특정 설문 조회, 수정, 삭제
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('../_lib/mongodb');

/**
 * 특정 설문 API 핸들러
 */
module.exports = async (req, res) => {
  // URL에서 ID 파라미터 추출
  const id = req.query.id;
  
  console.log(`[설문 API] ${req.method} /api/survey/${id}`);
  
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
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Survey ID is required'
    });
  }
  
  try {
    // MongoDB ID 형식 확인 및 변환
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid survey ID format'
      });
    }
    
    // 데이터베이스 연결
    const { db } = await connectToDatabase();
    const collection = db.collection('surveys');
    
    // GET 요청 - 설문 상세 조회
    if (req.method === 'GET') {
      const survey = await collection.findOne({ _id: objectId });
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }
      
      // 비밀번호 필드 제외한 데이터 반환
      const { creationPassword, ...surveyData } = survey;
      
      return res.status(200).json({
        success: true,
        data: surveyData
      });
    }
    
    // PUT 요청 - 설문 수정
    if (req.method === 'PUT') {
      const { password, ...updates } = req.body;
      
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Admin password is required'
        });
      }
      
      // 기존 설문 조회
      const survey = await collection.findOne({ _id: objectId });
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }
      
      // 비밀번호 검증
      const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
      
      if (!passwordMatch) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin password'
        });
      }
      
      // 업데이트 시간 추가
      updates.updatedAt = new Date();
      
      // 설문 업데이트
      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      // 비밀번호 필드 제외한 업데이트된 설문 반환
      const { creationPassword, ...updatedData } = result.value;
      
      return res.status(200).json({
        success: true,
        data: updatedData
      });
    }
    
    // DELETE 요청 - 설문 삭제
    if (req.method === 'DELETE') {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Admin password is required'
        });
      }
      
      // 기존 설문 조회
      const survey = await collection.findOne({ _id: objectId });
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      }
      
      // 비밀번호 검증
      const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
      
      if (!passwordMatch) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin password'
        });
      }
      
      // 설문 삭제
      await collection.deleteOne({ _id: objectId });
      
      // 관련 응답도 함께 삭제
      await db.collection('surveyResponses').deleteMany({ surveyId: objectId });
      
      return res.status(200).json({
        success: true,
        message: 'Survey and all associated responses deleted successfully'
      });
    }
    
    // 다른 메소드는 허용하지 않음
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
    
  } catch (error) {
    console.error(`[설문 API] 오류 (ID: ${id}):`, error);
    
    // 클라이언트에게 오류 응답
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};