import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// Gemini API 키
const API_KEY = process.env.GEMINI_API_KEY;

// 모델 설정
const MODEL_NAME = 'gemini-1.5-flash'; // 사용할 모델

// API 클라이언트 생성
let genAI: GoogleGenerativeAI | null = null;

// API 키가 있는 경우만 초기화
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log('Gemini API client initialized');
} else {
  console.warn('No Gemini API key found. AI features will not work.');
}

/**
 * 설문 생성을 위한 프롬프트 빌더
 * @param topic 설문 주제
 * @param questionCount 질문 수
 * @param additionalInstructions 추가 지시사항
 * @returns 생성할 프롬프트
 */
const buildSurveyPrompt = (
  topic: string,
  questionCount: number = 5,
  additionalInstructions?: string
): string => {
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
};

/**
 * 설문 응답 분석을 위한 프롬프트 빌더
 * @param surveyTitle 설문 제목
 * @param surveyDescription 설문 설명
 * @param questionStats 질문별 통계
 * @returns 생성할 프롬프트
 */
const buildAnalysisPrompt = (
  surveyTitle: string,
  surveyDescription: string,
  questionStats: any[]
): string => {
  return `
설문 제목: ${surveyTitle}
설문 설명: ${surveyDescription}

다음 설문 응답 데이터를 분석하고 통찰력 있는 요약을 제공해주세요:

${JSON.stringify(questionStats, null, 2)}

다음 내용을 포함하여 분석해주세요:
1. 주요 응답 패턴 및 경향
2. 흥미로운 통찰 또는 예상치 못한 결과
3. 데이터에서 발견된 상관관계 
4. 가능한 결론 및 제안

결과는 마크다운 형식으로 제공해주세요.
`;
};

/**
 * Gemini API를 이용하여 설문 생성
 * @param topic 설문 주제
 * @param questionCount 질문 수
 * @param additionalInstructions 추가 지시사항
 * @returns 생성된 설문 데이터
 */
export const generateSurvey = async (
  topic: string,
  questionCount: number = 5,
  additionalInstructions?: string
): Promise<any> => {
  if (!genAI) {
    throw new Error('Gemini API client not initialized. Check API key.');
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = buildSurveyPrompt(topic, questionCount, additionalInstructions);
    
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
    return surveyData;
  } catch (error) {
    console.error('Error generating survey with Gemini:', error);
    throw error;
  }
};

/**
 * Gemini API를 이용하여 설문 응답 분석
 * @param surveyTitle 설문 제목
 * @param surveyDescription 설문 설명
 * @param questionStats 질문별 통계
 * @returns 분석 결과
 */
export const analyzeSurveyResults = async (
  surveyTitle: string,
  surveyDescription: string,
  questionStats: any[]
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API client not initialized. Check API key.');
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = buildAnalysisPrompt(surveyTitle, surveyDescription, questionStats);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing survey results with Gemini:', error);
    throw error;
  }
};