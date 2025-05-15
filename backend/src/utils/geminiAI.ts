import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// API 키 확인
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
}

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(apiKey || '');

// 설문 생성 모델 - Gemini Pro 모델 사용
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * AI를 사용하여 설문지를 생성합니다.
 * @param prompt 설문 생성을 위한 프롬프트
 * @returns 생성된 설문 내용
 */
export async function generateSurvey(prompt: string): Promise<string> {
  try {
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

    // JSON 파싱 및 반환
    const jsonStr = jsonMatch[0];
    return jsonStr;
  } catch (error) {
    console.error('AI 설문 생성 중 오류 발생:', error);
    throw new Error('설문 생성에 실패했습니다. 다시 시도해주세요.');
  }
}

export default {
  generateSurvey
}; 