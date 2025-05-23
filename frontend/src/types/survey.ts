export interface Question {
  id: string;
  text: string;
  type: 'text' | 'singleChoice' | 'multipleChoice';
  options?: string[];
  required: boolean;
}

export interface Survey {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isActive: boolean;
  creationPassword?: string;
  password?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: {
    questionId: string;
    value: string | string[];
  }[];
  submittedAt: string;
}

export interface SurveyResult {
  surveyId: string;
  totalResponses: number;
  questionResults: {
    questionId: string;
    questionText: string;
    type: string;
    answers: {
      value: string | string[];
      count: number;
    }[];
  }[];
}

export interface PasswordVerificationRequest {
  surveyId: string;
  password: string;
}

export interface AIGenerationRequest {
  topic: string;
  questionCount: number;
  additionalInstructions?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SurveyResults {
  survey: Survey;
  analytics: {
    totalResponses: number;
    questionStats: Array<{
      questionId: string;
      answerDistribution: any;
    }>;
    aiSummary?: string;
  };
  isAuthenticated?: boolean;
  adminData?: {
    totalResponses: number;
    responses: any[];
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface RespondentInfo {
  name?: string;
  email?: string;
  studentId?: string;
  school?: string;
  grade?: string;
}

export interface Answer {
  questionId: string;
  value: string | string[];
}

export interface QuestionStat {
  questionId: string;
  answerDistribution: Record<string, number> | string[] | { average: number; counts: { value: number; count: number }[] };
}

export interface GenerateSurveyRequest {
  prompt: string;
}