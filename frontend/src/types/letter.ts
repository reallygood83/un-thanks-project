export interface Letter {
  _id?: string;
  id?: string;
  author: string;
  country: string;
  title?: string;
  content: string;
  approved?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // 추가 필드
  school?: string;
  grade?: string;
  studentCount?: number;
  translatedContent?: string;
  originalLanguage?: string;
  targetLanguage?: string;
}

export interface LetterSubmission {
  author: string;
  country: string;
  title?: string;
  content: string;
  school?: string;
  grade?: string;
  studentCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}