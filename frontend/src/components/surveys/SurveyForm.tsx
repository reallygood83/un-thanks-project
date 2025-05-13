import React, { useState } from 'react';
import { Survey, Question, RespondentInfo, Answer } from '../../types/survey';
import './SurveyForm.css';

interface SurveyFormProps {
  survey: Survey;
  onSubmit: (respondentInfo: RespondentInfo, answers: Answer[]) => Promise<void>;
  isSubmitting: boolean;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ 
  survey, 
  onSubmit,
  isSubmitting
}) => {
  const [respondentInfo, setRespondentInfo] = useState<RespondentInfo>({
    name: '',
    age: '',
    region: ''
  });
  
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRespondentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // 에러 상태 초기화
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 응답자 정보 검증
    if (!respondentInfo.name.trim()) {
      newErrors['name'] = '이름을 입력해주세요.';
    }
    
    // 필수 질문 응답 검증
    survey.questions.forEach(question => {
      if (question.required && 
          (answers[question.id] === undefined || 
           (typeof answers[question.id] === 'string' && !answers[question.id].trim()))) {
        newErrors[question.id] = '이 질문에 대한 응답이 필요합니다.';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // 폼에 오류가 있으면 제출하지 않음
      return;
    }
    
    // 응답을 API 형식에 맞게 변환
    const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value
    }));
    
    try {
      await onSubmit(respondentInfo, formattedAnswers);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  
  const renderQuestion = (question: Question) => {
    const { id, text, type, options = [] } = question;
    const error = errors[id];
    
    return (
      <div className={`question-container ${error ? 'error' : ''}`} key={id}>
        <div className="question-text">
          {text}
          {question.required && <span className="required-mark">*</span>}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="question-input">
          {type === 'text' && (
            <textarea
              value={answers[id] || ''}
              onChange={(e) => handleAnswerChange(id, e.target.value)}
              placeholder="답변을 입력해주세요."
              rows={4}
            />
          )}
          
          {type === 'multipleChoice' && (
            <div className="options-container">
              {options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type="radio"
                    name={`question-${id}`}
                    checked={answers[id] === option}
                    onChange={() => handleAnswerChange(id, option)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          )}
          
          {type === 'scale' && (
            <div className="scale-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answers[id] || 5}
                onChange={(e) => handleAnswerChange(id, Number(e.target.value))}
              />
              <div className="scale-labels">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
              <div className="selected-value">
                {answers[id] || 5}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <form className="survey-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{survey.title}</h2>
        <p className="survey-description">{survey.description}</p>
      </div>
      
      <div className="respondent-info-section">
        <h3>응답자 정보</h3>
        
        <div className={`form-group ${errors['name'] ? 'error' : ''}`}>
          <label htmlFor="name">이름 <span className="required-mark">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value={respondentInfo.name}
            onChange={handleInfoChange}
            placeholder="이름을 입력해주세요."
          />
          {errors['name'] && <div className="error-message">{errors['name']}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="age">연령대</label>
          <input
            type="text"
            id="age"
            name="age"
            value={respondentInfo.age}
            onChange={handleInfoChange}
            placeholder="예: 10대, 20대, 30대..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="region">거주 지역</label>
          <input
            type="text"
            id="region"
            name="region"
            value={respondentInfo.region}
            onChange={handleInfoChange}
            placeholder="예: 서울, 경기, 부산..."
          />
        </div>
      </div>
      
      <div className="questions-section">
        <h3>설문 질문</h3>
        {survey.questions.map(question => renderQuestion(question))}
      </div>
      
      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? '제출 중...' : '설문 제출하기'}
        </button>
      </div>
    </form>
  );
};

export default SurveyForm;