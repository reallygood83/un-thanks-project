import { Request, Response } from 'express';
import { generateSurvey } from '../utils/geminiAI';

/**
 * AI를 사용하여 설문지를 생성하는 API
 */
export default async function handleGenerateSurvey(req: Request, res: Response) {
  try {
    // 요청에서 프롬프트 가져오기
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: '설문 생성을 위한 설명(prompt)이 필요합니다.' 
      });
    }

    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gemini API를 사용하여 설문 생성
    const surveyJson = await generateSurvey(prompt);
    
    try {
      // JSON 문자열을 객체로 파싱
      const surveyData = JSON.parse(surveyJson);
      
      // 성공 응답
      return res.status(200).json({ 
        success: true, 
        message: 'AI 설문이 성공적으로 생성되었습니다.',
        data: surveyData
      });
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return res.status(500).json({ 
        success: false, 
        message: '생성된 설문 데이터를 처리하는 중 오류가 발생했습니다.',
        rawData: surveyJson
      });
    }
  } catch (error) {
    console.error('설문 생성 중 오류 발생:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: '설문 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 