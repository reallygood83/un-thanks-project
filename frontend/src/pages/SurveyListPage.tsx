import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { surveyApi } from '../api/surveyApi';
import { Survey } from '../types/survey';
import SurveyCard from '../components/surveys/SurveyCard';
import './SurveyListPage.css';

/**
 * 설문조사 목록 페이지 컴포넌트
 */
const SurveyListPage: React.FC = () => {
  // 상태 관리
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 설문 목록 불러오기
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await surveyApi.getAllSurveys();
        setSurveys(data);
      } catch (err) {
        console.error('Failed to fetch surveys:', err);
        setError('설문 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSurveys();
  }, []);
  
  // 설문 생성은 모든 사용자에게 허용
  // 실제 비밀번호는 설문 생성 시 설정하도록 함
  
  return (
    <div className="survey-list-page">
      <div className="page-header">
        <h1>미래로 AI 설문</h1>
        <p>
          AI가 분석하는 미래 통일 한국에 대한 설문조사 플랫폼입니다.
          여러분의 소중한 생각을 남겨주세요.
        </p>
      </div>
      
      <div className="admin-actions">
        <Link to="/survey/create" className="create-button">
          <span className="button-icon">+</span> 새 설문 만들기
        </Link>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>설문 목록을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">!</div>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="surveys-grid">
          {surveys.length > 0 ? (
            surveys.map(survey => (
              <div className="survey-card-wrapper" key={survey._id}>
                <SurveyCard survey={survey} />
              </div>
            ))
          ) : (
            <div className="empty-surveys">
              <div className="empty-icon">📋</div>
              <h2>아직 활성화된 설문이 없습니다</h2>
              <p>
                새로운 설문이 곧 등록될 예정입니다.
                또는 지금 새 설문을 직접 만들어보세요!
              </p>
              <Link to="/survey/create" className="create-empty-button">
                새 설문 만들기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveyListPage;