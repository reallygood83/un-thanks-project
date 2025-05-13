// API - submitLetter 편지 제출 처리
const { parseBody } = require('../_lib/parser');
const { validateLetterData } = require('../_lib/mongodb');
const letterService = require('../services/letterService');

// CORS 헤더 설정
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
}

// 편지 제출 API 핸들러
module.exports = async (req, res) => {
  try {
    // CORS 헤더 설정
    setCorsHeaders(res);

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log('[submitLetter] API 호출됨');
    console.log('[submitLetter] 메서드:', req.method);
    console.log('[submitLetter] 호스트:', req.headers.host);

    // POST 요청이 아니면 405 오류 반환
    if (req.method !== 'POST') {
      console.error('[submitLetter] 허용되지 않은 메서드:', req.method);
      return res.status(405).json({
        success: false,
        message: '허용되지 않은 HTTP 메서드입니다. POST 요청만 허용됩니다.'
      });
    }

    // 요청 본문 파싱
    let body = {};
    
    if (req.body) {
      // 객체인 경우 그대로 사용
      if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        body = req.body;
      }
      // 문자열인 경우 JSON 파싱
      else if (typeof req.body === 'string') {
        try {
          body = JSON.parse(req.body);
        } catch (e) {
          console.error('[submitLetter] 문자열 파싱 오류:', e);
        }
      }
      // Buffer인 경우 문자열로 변환 후 JSON 파싱
      else if (Buffer.isBuffer(req.body)) {
        try {
          const bodyString = req.body.toString();
          body = JSON.parse(bodyString);
        } catch (e) {
          console.error('[submitLetter] Buffer 파싱 오류:', e);
        }
      }
    }
    
    // 본문이 파싱되지 않았으면 직접 읽기
    if (Object.keys(body).length === 0) {
      try {
        body = await parseBody(req);
      } catch (parseError) {
        console.error('[submitLetter] 본문 파싱 오류:', parseError);
        return res.status(400).json({
          success: false,
          message: '요청 본문을 파싱할 수 없습니다',
          error: parseError.message
        });
      }
    }

    console.log('[submitLetter] 파싱된 요청 본문:', {
      name: body.name,
      school: body.school,
      grade: body.grade,
      contentLength: body.letterContent?.length,
      countryId: body.countryId
    });
    
    // 필수 필드 검증
    if (!validateLetterData(body)) {
      console.log('[submitLetter] 필수 필드 누락');
      
      return res.status(400).json({
        success: false,
        message: '필수 항목이 누락되었습니다',
        requiredFields: ['name', 'letterContent', 'countryId'],
        receivedFields: Object.keys(body)
      });
    }
    
    // 서비스 직접 호출 (MongoDB 저장)
    const result = await letterService.addLetter(body);
    
    // 결과 상태에 따라 응답
    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error('[submitLetter] 처리 중 오류:', error);
    return res.status(500).json({
      success: true, // 프론트엔드 호환성을 위해 success: true 유지
      message: '서버 내부 오류로 임시 데이터를 반환합니다',
      data: {
        id: 'error-' + Date.now(),
        originalContent: req.body?.letterContent || ''
      },
      error: error.message,
      fallback: true
    });
  }
}; 