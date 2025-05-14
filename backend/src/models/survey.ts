import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// 질문 인터페이스
export interface IQuestion extends Document {
  id: string;
  text: string;
  type: 'text' | 'multipleChoice' | 'scale';
  options?: string[];
  required: boolean;
}

// 질문 스키마
const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, default: () => uuidv4() },
  text: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'multipleChoice', 'scale']
  },
  options: { type: [String], required: false },
  required: { type: Boolean, default: true }
});

// 설문 인터페이스
export interface ISurvey extends Document {
  title: string;
  description: string;
  questions: IQuestion[];
  isActive: boolean;
  creationPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

// 설문 스키마
const SurveySchema = new Schema<ISurvey>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
  isActive: { type: Boolean, default: true },
  creationPassword: { type: String, required: true }, // 관리자 접근용 비밀번호
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 응답 인터페이스
export interface IAnswer {
  questionId: string;
  value: string | number | string[];
}

export interface ISurveyResponse extends Document {
  surveyId: mongoose.Types.ObjectId;
  respondentInfo: {
    name?: string;
    email?: string;
    age?: number;
    gender?: string;
  };
  answers: IAnswer[];
  createdAt: Date;
}

// 응답 스키마
const AnswerSchema = new Schema({
  questionId: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true } // 다양한 타입 지원
});

const SurveyResponseSchema = new Schema<ISurveyResponse>({
  surveyId: { type: Schema.Types.ObjectId, ref: 'Survey', required: true },
  respondentInfo: {
    name: { type: String },
    email: { type: String },
    age: { type: Number },
    gender: { type: String }
  },
  answers: { type: [AnswerSchema], required: true },
  createdAt: { type: Date, default: Date.now }
});

// 스키마에 인덱스 추가
SurveySchema.index({ createdAt: -1 }); // 최신순 조회 용이
SurveyResponseSchema.index({ surveyId: 1 }); // 설문별 응답 조회 용이

// 모델 생성 및 내보내기
export const Survey = mongoose.model<ISurvey>('Survey', SurveySchema);
export const SurveyResponse = mongoose.model<ISurveyResponse>('SurveyResponse', SurveyResponseSchema);