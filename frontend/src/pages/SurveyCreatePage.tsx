import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyApi } from '../api/surveyApi';
import { Survey, Question } from '../types/survey';
import QuestionListEditor from '../components/surveys/QuestionEditor';
import './SurveyCreatePage.css';

// 기본 질문 형식
const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q_' + Math.random().toString(36).substr(2, 9),
    text: '',
    type: 'text',
    required: true
  }
];

const SurveyCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [creationPassword, setCreationPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUsingAI, setIsUsingAI] = useState<boolean>(false);
  
  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '설문 제목을 입력해주세요.';
    }
    
    if (!description.trim()) {
      newErrors.description = '설문 설명을 입력해주세요.';
    }
    
    // 비밀번호 검증
    if (!creationPassword) {
      newErrors.creationPassword = '관리자 비밀번호를 설정해주세요.';
    } else if (creationPassword.length < 6) {
      newErrors.creationPassword = '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    
    if (creationPassword !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    // 질문 검증
    let hasQuestionError = false;
    const validQuestions = questions.every(question => {
      if (!question.text.trim()) {
        hasQuestionError = true;
        return false;
      }
      
      // 객관식 질문인 경우 옵션 검증
      if (question.type === 'multipleChoice' && question.options) {
        return question.options.every(option => option.trim() !== '');
      }
      
      return true;
    });
    
    if (!validQuestions) {
      newErrors.questions = '모든 질문 내용을 입력해주세요.';
    }
    
    if (questions.length === 0) {
      newErrors.questions = '최소 1개 이상의 질문이 필요합니다.';
    }
    
    // AI 프롬프트 검증
    if (isUsingAI && !aiPrompt.trim()) {
      newErrors.aiPrompt = 'AI 프롬프트를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // AI를 이용한 설문 생성
  const generateSurveyWithAI = async () => {
    if (!aiPrompt.trim()) {
      setErrors({ aiPrompt: 'AI 프롬프트를 입력해주세요.' });
      return;
    }
    
    try {
      setIsGenerating(true);
      setErrors({});
      
      // AI를 이용한 설문 생성 요청
      const generatedSurvey = await surveyApi.generateSurveyWithAI(aiPrompt);
      
      // 생성된 설문 정보 업데이트
      setTitle(generatedSurvey.title);
      setDescription(generatedSurvey.description);
      setQuestions(generatedSurvey.questions);
      
      // AI 모드 비활성화
      setIsUsingAI(false);
    } catch (error) {
      console.error('Failed to generate survey with AI:', error);
      setErrors({ aiPrompt: 'AI 설문 생성에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 설문 생성 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // 폼에 오류가 있으면 제출하지 않음
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // API 요청 데이터 준비
      const newSurvey: Omit<Survey, '_id' | 'createdAt' | 'updatedAt'> = {
        title,
        description,
        questions,
        isActive: true,
        creationPassword
      };
      
      // 설문 생성 API 호출
      const createdSurvey = await surveyApi.createSurvey(newSurvey);
      
      // 성공 시 설문 목록 페이지로 이동
      navigate('/survey');
    } catch (error) {
      console.error('Failed to create survey:', error);
      setErrors({ submit: '설문 생성에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="survey-create-page">
      <div className="create-page-header">
        <h1>새 설문 만들기</h1>
        <p className="page-description">
          통일 교육에 관한 새로운 설문을 만들어 학생들의 의견을 수집하세요.
        </p>
      </div>
      
      <div className="create-page-content">
        {isUsingAI ? (
          <div className="ai-prompt-section">
            <div className="section-header">
              <h2>AI로 설문 생성하기</h2>
              <button
                type="button"
                className="mode-switch-button"
                onClick={() => setIsUsingAI(false)}
              >
                수동 모드로 전환
              </button>
            </div>
            
            <div className="ai-prompt-form">
              <div className={`form-group ${errors.aiPrompt ? 'error' : ''}`}>
                <label htmlFor="ai-prompt">AI 프롬프트</label>
                <p className="field-description">
                  설문 주제와 목적을 구체적으로 설명해주세요. AI가 적절한 질문을 생성합니다.
                </p>
                <textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="예: 초등학생 대상 통일 교육 인식 조사 설문을 만들어줘. 통일에 대한 기대와 우려, 그리고 통일 교육의 효과에 대한 질문을 포함해야 해."
                  rows={6}
                  disabled={isGenerating}
                />
                {errors.aiPrompt && <div className="error-message">{errors.aiPrompt}</div>}
              </div>
              
              <button
                type="button"
                className="generate-button"
                onClick={generateSurveyWithAI}
                disabled={isGenerating}
              >
                {isGenerating ? '생성 중...' : 'AI로 설문 생성하기'}
              </button>
            </div>
          </div>
        ) : (
          <form className="create-survey-form" onSubmit={handleSubmit}>
            <div className="section-header">
              <h2>설문 정보</h2>
              <button
                type="button"
                className="mode-switch-button"
                onClick={() => setIsUsingAI(true)}
              >
                AI 모드로 전환
              </button>
            </div>
            
            <div className={`form-group ${errors.title ? 'error' : ''}`}>
              <label htmlFor="title">설문 제목</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="설문 제목을 입력하세요"
              />
              {errors.title && <div className="error-message">{errors.title}</div>}
            </div>
            
            <div className={`form-group ${errors.description ? 'error' : ''}`}>
              <label htmlFor="description">설문 설명</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설문의 목적과 내용을 설명하세요"
                rows={4}
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>
            
            <div className="password-section">
              <h3>관리자 비밀번호 설정</h3>
              <p className="section-description">
                설문 결과 조회, 수정, 삭제 시 필요한 비밀번호를 설정하세요.
              </p>
              
              <div className="form-row">
                <div className={`form-group ${errors.creationPassword ? 'error' : ''}`}>
                  <label htmlFor="creation-password">비밀번호</label>
                  <input
                    type="password"
                    id="creation-password"
                    value={creationPassword}
                    onChange={(e) => setCreationPassword(e.target.value)}
                    placeholder="비밀번호 (6자 이상)"
                  />
                  {errors.creationPassword && (
                    <div className="error-message">{errors.creationPassword}</div>
                  )}
                </div>
                
                <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
                  <label htmlFor="confirm-password">비밀번호 확인</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 확인"
                  />
                  {errors.confirmPassword && (
                    <div className="error-message">{errors.confirmPassword}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`questions-section ${errors.questions ? 'error' : ''}`}>
              <h3>설문 질문</h3>
              {errors.questions && <div className="error-message">{errors.questions}</div>}
              
              <QuestionListEditor
                questions={questions}
                onChange={setQuestions}
              />
            </div>
            
            {errors.submit && (
              <div className="form-error-message">
                {errors.submit}
              </div>
            )}
            
            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? '생성 중...' : '설문 생성하기'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate('/survey')}
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SurveyCreatePage;