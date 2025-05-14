import { Survey, ISurvey, SurveyResponse, ISurveyResponse, IAnswer } from '../models/survey';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * 모든 활성화된 설문 조회
 * @returns 활성화된 설문 목록
 */
export const getAllSurveys = async (includeInactive: boolean = false): Promise<ISurvey[]> => {
  try {
    const query = includeInactive ? {} : { isActive: true };
    const surveys = await Survey.find(query).sort({ createdAt: -1 });
    return surveys;
  } catch (error) {
    console.error('Error getting all surveys:', error);
    throw error;
  }
};

/**
 * ID로 특정 설문 조회
 * @param id 설문 ID
 * @returns 설문 정보
 */
export const getSurveyById = async (id: string): Promise<ISurvey | null> => {
  try {
    const survey = await Survey.findById(id);
    return survey;
  } catch (error) {
    console.error(`Error getting survey with ID ${id}:`, error);
    throw error;
  }
};

/**
 * 새 설문 생성
 * @param surveyData 설문 데이터
 * @returns 생성된 설문
 */
export const createSurvey = async (surveyData: Partial<ISurvey>): Promise<ISurvey> => {
  try {
    // 비밀번호 해싱
    if (surveyData.creationPassword) {
      const hashedPassword = await bcrypt.hash(surveyData.creationPassword, 10);
      surveyData.creationPassword = hashedPassword;
    }

    // 질문 ID 할당
    if (surveyData.questions) {
      surveyData.questions = surveyData.questions.map(q => ({
        ...q,
        id: q.id || uuidv4()
      }));
    }

    const newSurvey = new Survey(surveyData);
    await newSurvey.save();
    return newSurvey;
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
};

/**
 * 설문 수정
 * @param id 설문 ID
 * @param updates 업데이트할 데이터
 * @param password 관리자 비밀번호
 * @returns 업데이트된 설문
 */
export const updateSurvey = async (
  id: string,
  updates: Partial<ISurvey>,
  password: string
): Promise<ISurvey | null> => {
  try {
    // 비밀번호 검증
    const survey = await Survey.findById(id);
    
    if (!survey) {
      throw new Error('Survey not found');
    }

    const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
    
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    // 질문 ID 유지 및 새 질문에 ID 할당
    if (updates.questions) {
      updates.questions = updates.questions.map(q => ({
        ...q,
        id: q.id || uuidv4()
      }));
    }

    // 수정 시간 업데이트
    updates.updatedAt = new Date();

    // 설문 업데이트
    const updatedSurvey = await Survey.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return updatedSurvey;
  } catch (error) {
    console.error(`Error updating survey ${id}:`, error);
    throw error;
  }
};

/**
 * 설문 삭제
 * @param id 설문 ID
 * @param password 관리자 비밀번호
 * @returns 삭제 여부
 */
export const deleteSurvey = async (id: string, password: string): Promise<boolean> => {
  try {
    // 비밀번호 검증
    const survey = await Survey.findById(id);
    
    if (!survey) {
      throw new Error('Survey not found');
    }

    const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
    
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    // 설문 삭제
    await Survey.findByIdAndDelete(id);
    
    // 관련 응답도 함께 삭제
    await SurveyResponse.deleteMany({ surveyId: id });
    
    return true;
  } catch (error) {
    console.error(`Error deleting survey ${id}:`, error);
    throw error;
  }
};

/**
 * 설문 응답 제출
 * @param surveyId 설문 ID
 * @param responseData 응답 데이터
 * @returns 생성된 응답
 */
export const submitSurveyResponse = async (
  surveyId: string,
  responseData: {
    respondentInfo: {
      name?: string;
      email?: string;
      age?: number;
      gender?: string;
    };
    answers: IAnswer[];
  }
): Promise<ISurveyResponse> => {
  try {
    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    if (!survey.isActive) {
      throw new Error('Survey is no longer active');
    }
    
    // 응답 유효성 검증
    const requiredQuestions = survey.questions
      .filter(q => q.required)
      .map(q => q.id);
    
    const answeredQuestions = responseData.answers.map(a => a.questionId);
    
    // 필수 질문 응답 확인
    const missingRequiredAnswers = requiredQuestions.filter(
      qId => !answeredQuestions.includes(qId)
    );
    
    if (missingRequiredAnswers.length > 0) {
      throw new Error(`Missing answers for required questions: ${missingRequiredAnswers.join(', ')}`);
    }
    
    // 응답 생성
    const newResponse = new SurveyResponse({
      surveyId: new mongoose.Types.ObjectId(surveyId),
      respondentInfo: responseData.respondentInfo || {},
      answers: responseData.answers,
      createdAt: new Date()
    });
    
    await newResponse.save();
    return newResponse;
  } catch (error) {
    console.error(`Error submitting response for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * 설문 결과 조회
 * @param surveyId 설문 ID
 * @param includeResponses 개별 응답 포함 여부
 * @param adminPassword 관리자 비밀번호 (개별 응답 조회 시 필요)
 * @returns 설문 결과 정보
 */
export const getSurveyResults = async (
  surveyId: string,
  includeResponses: boolean = false,
  adminPassword?: string
): Promise<{
  survey: ISurvey;
  responses?: ISurveyResponse[];
  analytics: {
    totalResponses: number;
    questionStats: {
      questionId: string;
      questionText: string;
      answerDistribution: any;
    }[];
    aiSummary?: string;
  };
}> => {
  try {
    // 설문 조회
    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    // 관리자 권한 검증 (개별 응답 조회 시)
    let responses;
    if (includeResponses && adminPassword) {
      const passwordMatch = await bcrypt.compare(adminPassword, survey.creationPassword);
      
      if (!passwordMatch) {
        throw new Error('Invalid admin password');
      }
      
      // 개별 응답 조회
      responses = await SurveyResponse.find({ surveyId });
    }
    
    // 응답 통계 계산
    const allResponses = await SurveyResponse.find({ surveyId });
    const totalResponses = allResponses.length;
    
    // 질문별 통계
    const questionStats = survey.questions.map(question => {
      const allAnswers = allResponses
        .map(r => r.answers.find(a => a.questionId === question.id)?.value)
        .filter(Boolean);
      
      let answerDistribution: any = {};
      
      if (question.type === 'multipleChoice' && question.options) {
        // 선택지별 카운트
        question.options.forEach(option => {
          answerDistribution[option] = allAnswers.filter(a => a === option).length;
        });
      } else if (question.type === 'scale') {
        // 척도 평균
        const numericAnswers = allAnswers.map(a => Number(a)).filter(n => !isNaN(n));
        const sum = numericAnswers.reduce((acc, val) => acc + val, 0);
        answerDistribution = {
          average: numericAnswers.length > 0 ? sum / numericAnswers.length : 0,
          counts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({
            value: n,
            count: numericAnswers.filter(a => a === n).length
          }))
        };
      } else {
        // 텍스트 응답의 경우 단순 리스트
        answerDistribution = allAnswers;
      }
      
      return {
        questionId: question.id,
        questionText: question.text,
        answerDistribution
      };
    });
    
    // AI 분석 결과 생성
    let aiSummary;
    if (totalResponses > 0) {
      try {
        // Gemini API 서비스 임포트
        const { analyzeSurveyResults } = await import('./geminiService');
        
        // API 키가 설정된 경우에만 분석 실행
        if (process.env.GEMINI_API_KEY) {
          aiSummary = await analyzeSurveyResults(
            survey.title,
            survey.description,
            questionStats
          );
        } else {
          aiSummary = '이 AI 요약은 실제 Gemini API 통합 시 제공될 예정입니다.';
        }
      } catch (error) {
        console.error('Error generating AI analysis:', error);
        aiSummary = '분석 생성 중 오류가 발생했습니다.';
      }
    }
    
    return {
      survey,
      responses,
      analytics: {
        totalResponses,
        questionStats,
        aiSummary
      }
    };
  } catch (error) {
    console.error(`Error getting results for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * 비밀번호 검증
 * @param surveyId 설문 ID
 * @param password 검증할 비밀번호
 * @returns 비밀번호 일치 여부
 */
export const verifyPassword = async (surveyId: string, password: string): Promise<boolean> => {
  try {
    const survey = await Survey.findById(surveyId);
    
    if (!survey) {
      throw new Error('Survey not found');
    }
    
    const passwordMatch = await bcrypt.compare(password, survey.creationPassword);
    return passwordMatch;
  } catch (error) {
    console.error(`Error verifying password for survey ${surveyId}:`, error);
    return false;
  }
};