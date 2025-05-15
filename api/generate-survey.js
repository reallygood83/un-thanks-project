/**
 * Serverless API 엔드포인트 - AI 설문 생성
 */

// Google Gemini AI 라이브러리
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 환경 변수 가져오기
const apiKey = process.env.GEMINI_API_KEY;

// 요청 핸들러
module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // OPTIONS 메서드 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: '허용되지 않는 메서드입니다. POST 요청만 허용됩니다.' 
    });
  }

  try {
    // 요청에서 프롬프트 가져오기
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: '설문 생성을 위한 설명(prompt)이 필요합니다.' 
      });
    }

    // API 키 확인
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. 관리자에게 문의하세요.' 
      });
    }

    // Gemini API 초기화
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 설문지 형식에 관한 지시를 추가한 프롬프트
    const fullPrompt = `
      다음 지시에 따라 설문지를 생성해주세요:
      
      ${prompt}
      
      설문지는 다음 형식으로 JSON 형태로 반환해주세요:
      {
        "title": "설문지 제목",
        "description": "설문지 설명",
        "questions": [
          {
            "type": "single", // 선택지 타입 (single: 단일 선택, multiple: 복수 선택, text: 주관식)
            "question": "질문 내용",
            "required": true, // 필수 여부
            "options": ["옵션1", "옵션2", "옵션3"] // 선택지 (text 타입인 경우 빈 배열)
          },
          // 추가 질문들...
        ]
      }
      
      응답은 반드시 유효한 JSON 형식이어야 합니다.
    `;

    // AI 응답 생성
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // JSON 추출 (AI가 때때로 추가 설명을 포함할 수 있으므로)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('유효한 JSON 응답을 받지 못했습니다.');
    }

    // JSON 파싱 및 응답
    const jsonStr = jsonMatch[0];
    const surveyData = JSON.parse(jsonStr);

    // 성공 응답
    return res.status(200).json({ 
      success: true, 
      message: 'AI 설문이 성공적으로 생성되었습니다.',
      data: surveyData
    });
  } catch (error) {
    console.error('설문 생성 중 오류 발생:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: '설문 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
}; 