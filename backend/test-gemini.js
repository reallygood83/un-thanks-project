/**
 * Gemini API 연결 테스트 스크립트
 * 
 * 사용법:
 * 1. .env 파일에 GEMINI_API_KEY가 설정되어 있어야 합니다.
 * 2. 'node test-gemini.js' 명령어로 실행합니다.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// API 키 확인
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ 오류: GEMINI_API_KEY가 설정되지 않았습니다.');
  console.error('┌──────────────────────────────────────────────┐');
  console.error('│ .env 파일에 다음을 추가해주세요:              │');
  console.error('│ GEMINI_API_KEY=your-api-key                  │');
  console.error('└──────────────────────────────────────────────┘');
  process.exit(1);
}

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// 테스트 프롬프트
const testPrompt = `
다음 지시에 따라 설문지를 생성해주세요:

초등학생을 위한 통일 교육 인식 조사 설문을 만들어주세요. 북한과 통일에 대한 인식, 통일 교육의 효과성, 그리고 통일의 필요성에 관한 내용을 담아주세요.

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

// 테스트 함수
async function testGeminiApi() {
  console.log('🚀 Gemini API 연결 테스트 시작...');
  console.log('📝 테스트 프롬프트를 처리하는 중입니다...');
  
  try {
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ Gemini API 응답 성공!');
    
    // JSON 추출 (AI가 때때로 추가 설명을 포함할 수 있으므로)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('유효한 JSON 응답을 받지 못했습니다.');
    }
    
    // JSON 파싱
    const jsonStr = jsonMatch[0];
    const surveyData = JSON.parse(jsonStr);
    
    console.log('\n📊 생성된 설문 데이터:');
    console.log(`제목: ${surveyData.title}`);
    console.log(`설명: ${surveyData.description}`);
    console.log(`질문 수: ${surveyData.questions?.length || 0}`);
    
    console.log('\n🔍 첫 번째 질문 미리보기:');
    if (surveyData.questions && surveyData.questions.length > 0) {
      const q = surveyData.questions[0];
      console.log(`질문: ${q.question}`);
      console.log(`타입: ${q.type}`);
      if (q.options && q.options.length > 0) {
        console.log(`옵션: ${q.options.join(', ')}`);
      }
    }
    
    console.log('\n🎉 테스트 성공! Gemini API가 정상적으로 작동합니다.');
  } catch (error) {
    console.error('\n❌ 테스트 실패:');
    console.error(error);
    console.error('\n📌 가능한 원인:');
    console.error('- API 키가 잘못되었거나 만료되었습니다.');
    console.error('- 네트워크 연결 문제가 있습니다.');
    console.error('- Gemini API 서비스에 문제가 있습니다.');
    console.error('- 요청 제한을 초과했습니다.');
  }
}

// 테스트 실행
testGeminiApi(); 