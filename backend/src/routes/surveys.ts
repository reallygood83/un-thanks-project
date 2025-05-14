import express from 'express';
import {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  getSurveyResults,
  verifyPassword
} from '../services/surveyService';

const router = express.Router();

/**
 * 모든 설문 조회 (활성화된 설문만)
 * GET /api/surveys
 */
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const surveys = await getAllSurveys(includeInactive);
    
    return res.status(200).json({
      success: true,
      data: surveys.map(survey => ({
        _id: survey._id,
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
        isActive: survey.isActive,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting surveys:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch surveys',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * ID로 특정 설문 조회
 * GET /api/surveys/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const surveyId = req.params.id;
    const survey = await getSurveyById(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        _id: survey._id,
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
        isActive: survey.isActive,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt
      }
    });
  } catch (error) {
    console.error(`Error getting survey ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch survey',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 새 설문 생성
 * POST /api/surveys
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, questions, creationPassword } = req.body;
    
    // 필수 필드 검증
    if (!title || !description || !questions || !creationPassword) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, questions, creationPassword'
      });
    }
    
    // 모든 질문 유효성 검증
    for (const question of questions) {
      if (!question.text || !question.type) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have text and type fields'
        });
      }
      
      // multipleChoice 타입인 경우 options 필수
      if (question.type === 'multipleChoice' && (!question.options || question.options.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Multiple choice questions must have options'
        });
      }
    }
    
    const newSurvey = await createSurvey({
      title,
      description,
      questions,
      creationPassword,
      isActive: req.body.isActive ?? true
    });
    
    return res.status(201).json({
      success: true,
      data: {
        _id: newSurvey._id,
        title: newSurvey.title,
        description: newSurvey.description,
        questions: newSurvey.questions,
        isActive: newSurvey.isActive,
        createdAt: newSurvey.createdAt,
        updatedAt: newSurvey.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create survey',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 설문 수정
 * PUT /api/surveys/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const surveyId = req.params.id;
    const { password, ...updates } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }
    
    const updatedSurvey = await updateSurvey(surveyId, updates, password);
    
    if (!updatedSurvey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found or password incorrect'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        _id: updatedSurvey._id,
        title: updatedSurvey.title,
        description: updatedSurvey.description,
        questions: updatedSurvey.questions,
        isActive: updatedSurvey.isActive,
        createdAt: updatedSurvey.createdAt,
        updatedAt: updatedSurvey.updatedAt
      }
    });
  } catch (error) {
    console.error(`Error updating survey ${req.params.id}:`, error);
    
    // 비밀번호 오류 처리
    if (error instanceof Error && error.message === 'Invalid password') {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin password'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update survey',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 설문 삭제
 * DELETE /api/surveys/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const surveyId = req.params.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }
    
    const deleted = await deleteSurvey(surveyId, password);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found or password incorrect'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Survey and all associated responses deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting survey ${req.params.id}:`, error);
    
    // 비밀번호 오류 처리
    if (error instanceof Error && error.message === 'Invalid password') {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin password'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete survey',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 설문 응답 제출
 * POST /api/surveys/:id/responses
 */
router.post('/:id/responses', async (req, res) => {
  try {
    const surveyId = req.params.id;
    const { respondentInfo, answers } = req.body;
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers are required'
      });
    }
    
    const response = await submitSurveyResponse(surveyId, {
      respondentInfo: respondentInfo || {},
      answers
    });
    
    return res.status(201).json({
      success: true,
      data: {
        responseId: response._id
      }
    });
  } catch (error) {
    console.error(`Error submitting response for survey ${req.params.id}:`, error);
    
    // 특정 오류 처리
    if (error instanceof Error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      } else if (error.message === 'Survey is no longer active') {
        return res.status(400).json({
          success: false,
          message: 'This survey is no longer accepting responses'
        });
      } else if (error.message.includes('Missing answers for required questions')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to submit response',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 설문 결과 조회
 * GET /api/surveys/:id/results
 */
router.get('/:id/results', async (req, res) => {
  try {
    const surveyId = req.params.id;
    const password = req.query.password as string;
    const includeResponses = Boolean(password);
    
    const results = await getSurveyResults(surveyId, includeResponses, password);
    
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error(`Error getting results for survey ${req.params.id}:`, error);
    
    // 특정 오류 처리
    if (error instanceof Error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          success: false,
          message: 'Survey not found'
        });
      } else if (error.message === 'Invalid admin password') {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin password'
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to get survey results',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * 관리자 비밀번호 검증
 * POST /api/surveys/:id/verify
 */
router.post('/:id/verify', async (req, res) => {
  try {
    const surveyId = req.params.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    const isValid = await verifyPassword(surveyId, password);
    
    return res.status(200).json({
      success: isValid,
      message: isValid ? 'Password verified' : 'Invalid password'
    });
  } catch (error) {
    console.error(`Error verifying password for survey ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify password',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * AI를 이용한 설문 생성
 * POST /api/surveys/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { topic, questionCount, additionalInstructions } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Survey topic is required'
      });
    }
    
    // Gemini API 서비스 임포트
    const { generateSurvey } = await import('../services/geminiService');
    
    // API 키가 설정되지 않은 경우 오류 반환
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI generation is not available. API key not configured.'
      });
    }
    
    // 설문 생성
    const surveyData = await generateSurvey(
      topic, 
      questionCount || 5, 
      additionalInstructions
    );
    
    return res.status(200).json({
      success: true,
      data: surveyData
    });
  } catch (error) {
    console.error('Error generating survey with AI:', error);
    return res.status(500).json({
      success: false, 
      message: 'Failed to generate survey',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;