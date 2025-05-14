import React from 'react';
import { Link } from 'react-router-dom';
import { Survey } from '../../types/survey';
import './SurveyCard.css';

interface SurveyCardProps {
  survey: Survey;
}

/**
 * 설문 정보를 표시하는 카드 컴포넌트
 * 
 * @param survey 표시할 설문 정보
 */
const SurveyCard: React.FC<SurveyCardProps> = ({ survey }) => {
  const { _id, title, description, questions, createdAt, isActive } = survey;
  
  // 생성 날짜 포맷팅
  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '날짜 정보 없음';
  
  return (
    <div className={`survey-card ${!isActive ? 'inactive' : ''}`}>
      <div className="survey-card-content">
        <div className="survey-card-header">
          <h3 className="survey-title">{title}</h3>
          {!isActive && (
            <span className="survey-status">종료됨</span>
          )}
        </div>
        
        <p className="survey-description">{description}</p>
        
        <div className="survey-meta">
          <span className="question-count">
            <i className="meta-icon">&#x2753;</i> {questions?.length || 0}개 질문
          </span>
          <span className="created-date">
            <i className="meta-icon">&#x1F4C5;</i> {formattedDate}
          </span>
        </div>
      </div>
      
      <div className="survey-card-actions">
        <Link to={`/survey/${_id}`} className="take-survey-button">
          {isActive ? '설문 참여하기' : '설문 보기'}
        </Link>
        <Link to={`/survey/${_id}/results`} className="view-results-link">
          결과 보기
        </Link>
      </div>
    </div>
  );
};

export default SurveyCard;