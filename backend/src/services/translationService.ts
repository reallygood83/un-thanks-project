import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// 국가별 언어 코드 매핑
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  'usa': 'en', // 영어
  'uk': 'en', // 영어
  'turkey': 'tr', // 터키어
  'canada': 'en', // 영어 (프랑스어도 가능하지만 영어 기본)
  'australia': 'en', // 영어
  'philippines': 'fil', // 필리핀어 (타갈로그어)
  'thailand': 'th', // 태국어
  'netherlands': 'nl', // 네덜란드어
  'colombia': 'es', // 스페인어
  'greece': 'el', // 그리스어
  'new-zealand': 'en', // 영어
  'france': 'fr', // 프랑스어
  'belgium': 'nl', // 네덜란드어 (프랑스어, 독일어도 가능)
  'south-africa': 'en', // 영어
  'luxembourg': 'fr', // 프랑스어 (독일어, 룩셈부르크어도 가능)
  'ethiopia': 'am', // 암하라어
  'india': 'hi', // 힌디어
  'sweden': 'sv', // 스웨덴어
  'denmark': 'da', // 덴마크어
  'norway': 'no', // 노르웨이어
  'italy': 'it', // 이탈리아어
  'germany': 'de', // 독일어
};

/**
 * 텍스트를 대상 국가의 언어로 번역
 * (실제 구현 시 Google Cloud Translation API 또는 DeepL API 연동)
 */
export const translateText = async (text: string, countryId: string): Promise<string> => {
  try {
    // 국가 ID로 언어 코드 찾기
    const targetLanguage = COUNTRY_LANGUAGE_MAP[countryId] || 'en';
    
    // TODO: 실제 번역 API 연동
    // 현재는 개발용 목업 응답
    // Google Cloud Translation API 예시:
    /*
    const response = await axios.post(
      `https://translation.googleapis.com/v2/translate`,
      {
        q: text,
        target: targetLanguage,
        format: 'text',
      },
      {
        headers: { Authorization: `Bearer ${process.env.GOOGLE_API_KEY}` },
      }
    );
    return response.data.translations[0].translatedText;
    */
    
    // 개발용 목업 응답
    return `[번역된 내용 (${targetLanguage}): ${text.substring(0, 30)}...]`;
  } catch (error) {
    console.error('Translation error:', error);
    // 오류 발생 시 원본 텍스트 반환
    return `[번역 오류 - 원본: ${text}]`;
  }
};

export default {
  translateText,
};