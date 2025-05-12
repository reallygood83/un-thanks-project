import axios from 'axios';
import dotenv from 'dotenv';
import Country from '../models/country';

dotenv.config();

/**
 * 국가 ID로 언어 코드 조회
 */
export const getLanguageByCountryId = async (countryId: string): Promise<string> => {
  try {
    // MongoDB에서 국가 조회
    const country = await Country.findById(countryId);

    // 국가 데이터가 있으면 언어 코드 반환, 없으면 기본값 'en' 반환
    return country?.language || 'en';
  } catch (error) {
    console.error(`Error getting language for country ID ${countryId}:`, error);
    return 'en'; // 오류 발생 시 기본값 영어 반환
  }
};

/**
 * 국가 코드로 언어 코드 조회
 */
export const getLanguageByCountryCode = async (countryCode: string): Promise<string> => {
  try {
    // MongoDB에서 국가 조회
    const country = await Country.findOne({ code: countryCode });

    // 국가 데이터가 있으면 언어 코드 반환, 없으면 기본값 'en' 반환
    return country?.language || 'en';
  } catch (error) {
    console.error(`Error getting language for country code ${countryCode}:`, error);
    return 'en'; // 오류 발생 시 기본값 영어 반환
  }
};

/**
 * 텍스트를 대상 국가의 언어로 번역
 * (실제 구현 시 Google Cloud Translation API 또는 DeepL API 연동)
 */
export const translateText = async (text: string, countryId: string): Promise<string> => {
  try {
    // 국가 ID로 언어 코드 찾기
    const targetLanguage = await getLanguageByCountryId(countryId);

    // Google API 키 확인
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === 'your_google_api_key') {
      // API 키가 설정되지 않은 경우 개발용 목업 응답 반환
      return `[번역된 내용 (${targetLanguage}): ${text.substring(0, 30)}...]`;
    }

    // Google Cloud Translation API 호출
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2`,
        {},
        {
          params: {
            q: text,
            target: targetLanguage,
            format: 'text',
            key: apiKey
          }
        }
      );

      // 번역 결과 반환
      return response.data.data.translations[0].translatedText;
    } catch (apiError) {
      console.error('Google Translate API error:', apiError);
      // API 호출 오류 시 개발용 목업 응답 반환
      return `[번역된 내용 (${targetLanguage}): ${text.substring(0, 30)}...]`;
    }
  } catch (error) {
    console.error('Translation error:', error);
    // 오류 발생 시 원본 텍스트 반환
    return `[번역 오류 - 원본: ${text}]`;
  }
};

export default {
  translateText,
  getLanguageByCountryId,
  getLanguageByCountryCode
};