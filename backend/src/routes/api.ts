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
        success: true, // 프론트엔드가 기대하는 success 필드 추가
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
      
      // 필수 필드 검증 (이메일 제외)
      if (!name || !letterContent || !countryId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      // 번역 없이 원본 내용만 저장
      const translatedContent = ''; // 번역 비활성화
      
      // 새 편지 생성
      const newLetter = await createLetter({
        name,
        email: email || '',
        school: school || '',
        grade: grade || '',
        letterContent,
        translatedContent,
        originalContent: true, // 항상 true로 설정
        countryId,
        createdAt: new Date()
      });
      
      // 프론트엔드 기대 포맷에 맞춰 응답
      return res.status(201).json({
        success: true,
        data: {
          id: newLetter._id,
          originalContent: letterContent
        }
      });
    }
    
    // 번역 미리보기 액션 처리
    if (action === 'translatePreview') {
      // 번역 기능 비활성화로 미리보기도 빈 응답 제공
      return res.status(200).json({
        success: true,
        data: {
          translatedContent: ''
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