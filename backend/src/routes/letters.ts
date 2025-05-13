import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as letterService from '../services/letterService';

const router = express.Router();

// GET all letters
router.get('/', async (req, res) => {
  try {
    // Get query parameters
    const { countryId } = req.query;
    
    // Get letters with optional country filter
    const letters = await letterService.getLetters(countryId as string);
    
    // Return letters with personal information removed (번역 제외)
    const sanitizedLetters = letters.map(letter => ({
      id: letter._id,
      name: letter.name,
      school: letter.school,
      grade: letter.grade,
      letterContent: letter.letterContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt
    }));
    
    res.status(200).json({
      success: true,
      data: sanitizedLetters
    });
  } catch (error) {
    console.error('Error fetching letters:', error);
    res.status(500).json({
      message: 'An error occurred while fetching letters',
      success: false
    });
  }
});

// GET a specific letter by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const letter = await letterService.getLetterById(id);
    
    if (!letter) {
      return res.status(404).json({
        message: 'Letter not found',
        success: false
      });
    }
    
    // Return letter with personal information removed (번역 제외)
    const sanitizedLetter = {
      id: letter._id,
      name: letter.name,
      school: letter.school,
      grade: letter.grade,
      letterContent: letter.letterContent,
      countryId: letter.countryId,
      createdAt: letter.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: sanitizedLetter
    });
  } catch (error) {
    console.error('Error fetching letter:', error);
    res.status(500).json({
      message: 'An error occurred while fetching the letter',
      success: false
    });
  }
});

// GET letter statistics
router.get('/stats/country', async (req, res) => {
  try {
    const stats = await letterService.getLetterStatsByCountry();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching letter statistics:', error);
    res.status(500).json({
      message: 'An error occurred while fetching letter statistics',
      success: false
    });
  }
});

// POST a new letter
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      school, 
      grade, 
      letterContent, 
      originalContent, 
      countryId 
    } = req.body;
    
    // Validate required fields (이메일 제외)
    if (!name || !letterContent || !countryId) {
      return res.status(400).json({
        message: 'Missing required fields',
        success: false
      });
    }
    
    // 번역 없이 원본 내용만 저장
    const translatedContent = '';
    
    // Create the new letter
    const newLetter = await letterService.createLetter({
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
    
    console.log(`New letter saved with ID: ${newLetter._id} for country: ${countryId}`);
    
    // Return success response (번역 제외)
    res.status(201).json({
      message: 'Letter successfully submitted',
      success: true,
      data: {
        id: newLetter._id,
        originalContent: letterContent
      }
    });
  } catch (error) {
    console.error('Error submitting letter:', error);
    res.status(500).json({
      message: 'An error occurred while submitting your letter',
      success: false
    });
  }
});

export default router;