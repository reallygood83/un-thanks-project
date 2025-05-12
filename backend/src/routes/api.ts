import express from 'express';
import { getLetters, createLetter, getLetterById } from '../services/letterService';
import { getAllCountries, getCountryById, getCountryByCode } from '../services/countryService';
import { translateText } from '../services/translationService';

const router = express.Router();

// 레거시 API 인터페이스 - 액션 파라미터 기반 라우팅
router.get('/', async (req, res) => {
  try {
    const action = req.query.action as string;
    
    // 액션이 없으면 건강 상태 반환
    if (!action) {
      return res.status(200).json({
        message: 'API is working!',
        status: 'ok'
      });
    }
    
    // 편지 목록 가져오기
    if (action === 'getLetters') {
      const countryId = req.query.countryId as string;
      const letters = await getLetters(countryId);
      
      // 프론트엔드 기대 포맷에 맞춰 응답
      return res.status(200).json({
        success: true,
        data: letters.map(letter => ({
          id: letter._id,
          name: letter.name,
          school: letter.school,
          grade: letter.grade,
          letterContent: letter.letterContent,
          translatedContent: letter.translatedContent,
          countryId: letter.countryId,
          createdAt: letter.createdAt
        }))
      });
    }
    
    // 국가 목록 가져오기
    if (action === 'getCountries') {
      const countries = await getAllCountries();
      
      return res.status(200).json({
        success: true,
        data: countries
      });
    }
    
    // 특정 국가 정보 가져오기
    if (action === 'getCountry') {
      const id = req.query.id as string;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Country ID is required'
        });
      }
      
      const country = await getCountryById(id);
      
      if (!country) {
        return res.status(404).json({
          success: false,
          message: 'Country not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: country
      });
    }
    
    // 알 수 없는 액션
    return res.status(400).json({
      success: false,
      message: `Unknown action: ${action}`
    });
    
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 편지 제출 처리
router.post('/', async (req, res) => {
  try {
    const action = req.query.action as string;
    
    // 편지 제출 액션 처리
    if (action === 'submitLetter') {
      const { 
        name, 
        email, 
        school, 
        grade, 
        letterContent, 
        originalContent, 
        countryId 
      } = req.body;
      
      // 필수 필드 검증
      if (!name || !email || !letterContent || !countryId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      // 번역 수행
      const translatedContent = await translateText(letterContent, countryId);
      
      // 새 편지 생성
      const newLetter = await createLetter({
        name,
        email,
        school: school || '',
        grade: grade || '',
        letterContent,
        translatedContent,
        originalContent: !!originalContent,
        countryId,
        createdAt: new Date()
      });
      
      // 프론트엔드 기대 포맷에 맞춰 응답
      return res.status(201).json({
        success: true,
        data: {
          id: newLetter._id,
          translatedContent,
          originalContent: letterContent
        }
      });
    }
    
    // 알 수 없는 액션
    return res.status(400).json({
      success: false,
      message: `Unknown action: ${action}`
    });
    
  } catch (error) {
    console.error('Error in POST API route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;