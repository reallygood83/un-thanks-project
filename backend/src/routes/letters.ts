import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage for letters (would be a database in a real app)
interface Letter {
  id: string;
  name: string;
  email: string;
  school: string;
  grade: string;
  letterContent: string;
  translatedContent: string;
  originalContent: boolean;
  countryId: string;
  createdAt: Date;
}

const letters: Letter[] = [];

// GET all letters
router.get('/', async (req, res) => {
  try {
    // Get query parameters
    const { countryId } = req.query;
    
    // Filter letters if country ID is provided
    let filteredLetters = letters;
    if (countryId) {
      filteredLetters = letters.filter(letter => letter.countryId === countryId);
    }
    
    // Sort by creation date (newest first)
    filteredLetters.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Return letters with personal information removed
    const sanitizedLetters = filteredLetters.map(letter => ({
      id: letter.id,
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
    const letter = letters.find(l => l.id === id);
    
    if (!letter) {
      return res.status(404).json({
        message: 'Letter not found',
        success: false
      });
    }
    
    // Return letter with personal information removed
    const sanitizedLetter = {
      id: letter.id,
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
    
    // Mock translation
    const translatedContent = `[Translated version of: ${letterContent}]`;
    
    // Create and store the new letter
    const newLetter: Letter = {
      id: uuidv4(),
      name,
      email,
      school: school || '',
      grade: grade || '',
      letterContent,
      translatedContent,
      originalContent: !!originalContent,
      countryId,
      createdAt: new Date()
    };
    
    letters.push(newLetter);
    
    console.log(`New letter saved with ID: ${newLetter.id} for country: ${countryId}`);
    
    // Return success response with translated content
    res.status(201).json({
      message: 'Letter successfully submitted',
      success: true,
      data: {
        id: newLetter.id,
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