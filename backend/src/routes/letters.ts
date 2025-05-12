import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as letterService from '../services/letterService';
import { translateText } from '../services/translationService';

const router = express.Router();

// GET all letters
router.get('/', async (req, res) => {
  try {
    // Get query parameters
    const { countryId } = req.query;
    
    // Get letters with optional country filter
    const letters = await letterService.getLetters(countryId as string);
    
    // Return letters with personal information removed
    const sanitizedLetters = letters.map(letter => ({
      id: letter._id,
      name: letter.name,
      school: letter.school,
      grade: letter.grade,
      letterContent: letter.letterContent,
      translatedContent: letter.translatedContent,
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
    
    // Return letter with personal information removed
    const sanitizedLetter = {
      id: letter._id,
      name: letter.name,
      school: letter.school,
      grade: letter.grade,
      letterContent: letter.letterContent,
      translatedContent: letter.translatedContent,
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
    
    // Validate required fields
    if (!name || !email || !letterContent || !countryId) {
      return res.status(400).json({
        message: 'Missing required fields',
        success: false
      });
    }
    
    // TODO: 실제 번역 API 연동 (현재는 목업)
    // const translatedContent = await translateText(letterContent, countryId);
    const translatedContent = `[Translated version of: ${letterContent}]`;
    
    // Create the new letter
    const newLetter = await letterService.createLetter({
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
    
    console.log(`New letter saved with ID: ${newLetter._id} for country: ${countryId}`);
    
    // Return success response with translated content
    res.status(201).json({
      message: 'Letter successfully submitted',
      success: true,
      data: {
        id: newLetter._id,
        translatedContent,
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