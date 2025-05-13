export interface Question {
  id: string;
  text: string;
  type: 'text' | 'singleChoice' | 'multipleChoice';
  options?: string[];
  required: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
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