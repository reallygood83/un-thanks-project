import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyApi } from '../api/surveyApi';
import { Survey, RespondentInfo, Answer } from '../types/survey';
import SurveyForm from '../components/surveys/SurveyForm';
import './SurveyDetailPage.css';

const SurveyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) {
        setError('설문 ID가 필요합니다.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await surveyApi.getSurveyById(id);
        setSurvey(data);
      } catch (err) {
        console.error(`Error fetching survey with ID ${id}:`, err);
        setError('설문을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSurvey();
  }, [id]);
  
  const handleSubmit = async (respondentInfo: RespondentInfo, answers: Answer[]) => {
    if (!id || !survey) return;
    
    // 디버깅: 제출 데이터 확인
    console.log('[SurveyDetailPage] 제출할 응답 데이터:', {
      surveyId: id,
      respondentInfo,
      answers
    });
    
    try {
      setIsSubmitting(true);
      await surveyApi.submitResponse(id, {
        respondentInfo,
        answers
      });
      
      setIsSubmitted(true);
      // 제출 완료 후 결과 페이지나 감사 페이지로 이동할 수 있음
      // navigate(`/survey/${id}/thank-you`);
    } catch (err) {
      console.error('Error submitting survey response:', err);
      alert('응답 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="survey-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>설문을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }
  
  if (error || !survey) {
    return (
      <div className="survey-detail-page">
        <div className="error-container">
          <div className="error-icon">!</div>
          <h2>오류가 발생했습니다</h2>
          <p>{error || '설문을 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate('/survey')} className="back-button">
            설문 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  if (isSubmitted) {
    return (
      <div className="survey-detail-page">
        <div className="thank-you-container">
          <div className="thank-you-icon">✓</div>
          <h2>설문이 성공적으로 제출되었습니다!</h2>
          <p>소중한 응답에 감사드립니다. 결과는 연구 및 분석에 큰 도움이 될 것입니다.</p>
          <div className="thank-you-buttons">
            <button onClick={() => navigate(`/survey/${id}/results`)} className="view-results-button">
              결과 보기
            </button>
            <button onClick={() => navigate('/survey')} className="back-button">
              설문 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!survey.isActive) {
    return (
      <div className="survey-detail-page">
        <div className="inactive-survey-container">
          <div className="inactive-icon">!</div>
          <h2>종료된 설문입니다</h2>
          <p>이 설문은 현재 활성화되어 있지 않습니다. 다른 설문에 참여해주세요.</p>
          <button onClick={() => navigate('/survey')} className="back-button">
            설문 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="survey-detail-page">
      <div className="survey-detail-container">
        <SurveyForm
          survey={survey}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default SurveyDetailPage;