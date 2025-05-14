const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini API 키
const API_KEY = process.env.GEMINI_API_KEY;

// 모델 설정
const MODEL_NAME = 'gemini-1.5-flash'; // 사용할 모델

/**
 * 설문 생성을 위한 프롬프트 빌더
 * @param topic 설문 주제
 * @param questionCount 질문 수
 * @param additionalInstructions 추가 지시사항
 * @returns 생성할 프롬프트
 */
function buildSurveyPrompt(
  topic,
  questionCount = 5,
  additionalInstructions
) {
  return `
주제: ${topic}

다음 주제에 대한 설문조사를 생성해주세요. 
총 ${questionCount}개의 질문을 만들어주세요.
다양한 질문 유형(주관식, 객관식, 척도)을 포함해주세요.

${additionalInstructions ? `추가 지시사항: ${additionalInstructions}` : ''}

결과를 다음 JSON 형식으로 제공해주세요:
{
  "title": "설문 제목",
  "description": "설문 설명",
  "questions": [
    {
      "id": "q1",
      "text": "질문 내용",
      "type": "text", // 'text', 'multipleChoice', 'scale' 중 하나
      "options": ["선택지1", "선택지2"], // type이 'multipleChoice'인 경우에만 필요
      "required": true
    }
    // 추가 질문들...
  ]
}
`;
}

/**
 * Gemini API를 이용하여 설문 생성
 */
async function generateSurvey(req, res) {
  try {
    const { topic, questionCount, additionalInstructions } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Survey topic is required'
      });
    }
    
    // API 키가 설정되지 않은 경우 오류 반환
    if (!API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI generation is not available. API key not configured.'
      });
    }
    
    // Gemini API 클라이언트 초기화
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // 프롬프트 생성
    const prompt = buildSurveyPrompt(
      topic, 
      questionCount || 5, 
      additionalInstructions
    );
    
    // 설문 생성
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response');
    }
    
    // JSON 파싱
    const surveyData = JSON.parse(jsonMatch[0]);
    
    return res.status(200).json({
      success: true,
      data: surveyData
    });
  } catch (error) {
    console.error('Error generating survey with AI:', error);
    
    return res.status(500).json({
      success: false, 
      message: 'Failed to generate survey',
      error: error.message
    });
  }
}

// API 라우터
module.exports = async (req, res) => {
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
    res.status(200).end();
    return;
  }

  // 요청 메서드에 따라 처리
  try {
    switch (req.method) {
      case 'POST':
        return await generateSurvey(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};