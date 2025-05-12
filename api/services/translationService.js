// 번역 서비스 - 다양한 언어로 텍스트 번역

// 번역 API 키 (환경 변수에서 로드)
const TRANSLATION_API_KEY = process.env.TRANSLATION_API_KEY || '';

/**
 * 언어 코드 매핑 - 국가 ID에서 언어 코드로 변환
 */
const COUNTRY_LANGUAGE_MAP = {
  'usa': 'en',       // 미국: 영어
  'uk': 'en',        // 영국: 영어
  'france': 'fr',    // 프랑스: 프랑스어
  'turkey': 'tr',    // 터키: 터키어 
  'canada': 'en',    // 캐나다: 영어
  'australia': 'en', // 호주: 영어
  'netherlands': 'nl', // 네덜란드: 네덜란드어
  'philippines': 'tl', // 필리핀: 타갈로그어
  'thailand': 'th',  // 태국: 태국어
  'colombia': 'es',  // 콜롬비아: 스페인어
  'ethiopia': 'am',  // 에티오피아: 암하라어
  'greece': 'el',    // 그리스: 그리스어
  'belgium': 'fr',   // 벨기에: 프랑스어(간소화)
  'italy': 'it',     // 이탈리아: 이탈리아어
  'luxembourg': 'fr', // 룩셈부르크: 프랑스어(간소화)
  'india': 'hi',     // 인도: 힌디어
  'sweden': 'sv',    // 스웨덴: 스웨덴어
  'germany': 'de',   // 독일: 독일어
};

/**
 * 국가 ID로 언어 코드 가져오기
 * @param {string} countryId - 국가 ID
 * @returns {string} - 언어 코드
 */
const getLanguageByCountryId = (countryId) => {
  return COUNTRY_LANGUAGE_MAP[countryId] || 'en'; // 기본값은 영어
};

/**
 * 텍스트 번역 - 국가별 언어로 번역
 * 참고: 실제 환경에서는 Google Cloud Translation API 등 활용
 * 
 * @param {string} text - 번역할 텍스트
 * @param {string} countryId - 국가 ID
 * @returns {Promise<string>} - 번역된 텍스트
 */
const translateText = async (text, countryId) => {
  try {
    // 대상 언어 코드 가져오기
    const targetLanguage = getLanguageByCountryId(countryId);
    
    // API 키가 없거나 개발 환경이면 모의 번역 반환
    if (!TRANSLATION_API_KEY || process.env.NODE_ENV !== 'production') {
      return mockTranslation(text, targetLanguage);
    }
    
    // 실제 번역 API 호출 - Google Cloud Translation API 예시
    try {
      // TODO: 실제 API 구현
      // 여기에 실제 번역 API 호출 코드를 구현
      // 현재는 모의 번역으로 대체
      return mockTranslation(text, targetLanguage);
    } catch (error) {
      console.error('Translation API error:', error);
      return mockTranslation(text, targetLanguage);
    }
  } catch (error) {
    console.error('Translation service error:', error);
    return `[Translation Error] ${text.substring(0, 30)}...`;
  }
};

/**
 * 모의 번역 함수 - API 없이 기본 번역 시뮬레이션
 * 
 * @param {string} text - 원본 텍스트
 * @param {string} targetLanguage - 대상 언어 코드
 * @returns {string} - 가상 번역 텍스트
 */
const mockTranslation = (text, targetLanguage) => {
  // 언어별 접두사 매핑
  const prefixes = {
    'en': '[English]',
    'fr': '[Français]',
    'tr': '[Türkçe]',
    'nl': '[Nederlands]',
    'tl': '[Tagalog]',
    'th': '[ภาษาไทย]',
    'es': '[Español]',
    'am': '[አማርኛ]',
    'el': '[Ελληνικά]',
    'it': '[Italiano]',
    'hi': '[हिन्दी]',
    'sv': '[Svenska]',
    'de': '[Deutsch]'
  };

  // 언어별 인사말
  const greetings = {
    'en': 'Thank you for your participation in the Korean War.',
    'fr': 'Merci pour votre participation à la guerre de Corée.',
    'tr': 'Kore Savaşı'na katılımınız için teşekkür ederiz.',
    'nl': 'Bedankt voor uw deelname aan de Koreaanse Oorlog.',
    'tl': 'Salamat sa iyong pakikilahok sa Digmaang Koreano.',
    'th': 'ขอบคุณสำหรับการมีส่วนร่วมในสงครามเกาหลี',
    'es': 'Gracias por su participación en la Guerra de Corea.',
    'am': 'በኮሪያ ጦርነት ላይ ስለተሳተፉ እናመሰግናለን።',
    'el': 'Σας ευχαριστούμε για τη συμμετοχή σας στον Πόλεμο της Κορέας.',
    'it': 'Grazie per la vostra partecipazione alla guerra di Corea.',
    'hi': 'कोरियाई युद्ध में आपकी भागीदारी के लिए धन्यवाद।',
    'sv': 'Tack för ert deltagande i Koreakriget.',
    'de': 'Vielen Dank für Ihre Teilnahme am Koreakrieg.'
  };

  const prefix = prefixes[targetLanguage] || '[Translated]';
  const greeting = greetings[targetLanguage] || 'Thank you for your help in the Korean War.';
  
  // 원본 텍스트 일부 + 언어별 인사말 조합
  return `${prefix} ${greeting}\n\n${text.substring(0, 50)}...`;
};

module.exports = {
  translateText,
  getLanguageByCountryId,
  mockTranslation
};