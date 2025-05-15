import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyApi } from '../api/surveyApi';
import { 
  SurveyResults, 
  Question, 
  QuestionStat 
} from '../types/survey';
import { 
  SimpleBarChart, 
  SimplePieChart, 
  ScaleDistributionChart, 
  TextResponses, 
  AiAnalysisView 
} from '../components/surveys/ResultsChart';
import './SurveyResultPage.css';

const SurveyResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        setError('설문 ID가 필요합니다.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // 관리자 모드인 경우 비밀번호와 함께 요청
        const data = await surveyApi.getSurveyResults(id, isAdmin ? password : undefined);
        console.log('API 응답 데이터:', data);
        
        if (data && data.analytics) {
          console.log('총 응답수:', data.analytics.totalResponses);
          console.log('질문 통계:', data.analytics.questionStats);
        }
        
        setResults(data);
      } catch (err) {
        console.error(`Error fetching survey results for ${id}:`, err);
        setError('결과를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id, isAdmin, password]);
  
  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdmin(true);
  };
  
  // 질문별로 적절한 차트 컴포넌트 렌더링
  const renderQuestionResults = (question: Question, stat: QuestionStat) => {
    const { type } = question;
    const { answerDistribution } = stat;
    
    if (type === 'multipleChoice' && question.options) {
      const data = question.options.map(option => ({
        name: option,
        value: (answerDistribution as Record<string, number>)[option] || 0
      }));
      
      // 막대 차트 또는 파이 차트 선택 (옵션 수에 따라)
      return question.options.length <= 6 
        ? <SimplePieChart data={data} title={question.text} />
        : <SimpleBarChart data={data} title={question.text} />;
    }
    
    if (type === 'scale') {
      const { average, counts } = answerDistribution as { average: number, counts: { value: number, count: number }[] };
      return (
        <ScaleDistributionChart 
          data={counts} 
          average={average} 
          title={question.text} 
        />
      );
    }
    
    if (type === 'text') {
      return (
        <TextResponses 
          responses={answerDistribution as string[]} 
          title={question.text} 
        />
      );
    }
    
    return null;
  };
  
  if (loading) {
    return (
      <div className="survey-result-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>결과를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }
  
  if (error || !results) {
    return (
      <div className="survey-result-page">
        <div className="error-container">
          <div className="error-icon">!</div>
          <h2>오류가 발생했습니다</h2>
          <p>{error || '결과를 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate('/survey')} className="back-button">
            설문 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  const { survey, analytics } = results;
  
  // 관리자 비밀번호 입력 폼 표시
  if (showPasswordForm && !isAdmin) {
    return (
      <div className="survey-result-page">
        <div className="password-form-container">
          <h2>관리자 액세스</h2>
          <p>상세한 결과를 보기 위해 관리자 비밀번호를 입력해주세요.</p>
          
          <form onSubmit={handleAdminAccess} className="password-form">
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                확인
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowPasswordForm(false)}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // 응답이 없는 경우
  if (analytics.totalResponses === 0) {
    return (
      <div className="survey-result-page">
        <div className="results-header">
          <h1>{survey.title} - 결과</h1>
          <p className="results-description">{survey.description}</p>
        </div>
        
        <div className="no-responses-container">
          <div className="no-responses-icon">📊</div>
          <h2>아직 응답이 없습니다</h2>
          <p>이 설문에 대한 응답이 제출되면 여기에 결과가 표시됩니다.</p>
          <div className="results-actions">
            <button onClick={() => navigate(`/survey/${id}`)} className="take-survey-button">
              설문 참여하기
            </button>
            <button onClick={() => navigate('/survey')} className="back-button">
              설문 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="survey-result-page">
      <div className="results-header">
        <h1>{survey.title} - 결과</h1>
        <p className="results-description">{survey.description}</p>
        
        <div className="results-stats">
          <div className="stat-item">
            <div className="stat-label">총 응답수</div>
            <div className="stat-value">{analytics.totalResponses}</div>
          </div>
          
          {!isAdmin && (
            <button 
              className="admin-access-button"
              onClick={() => setShowPasswordForm(true)}
            >
              관리자 액세스
            </button>
          )}
        </div>
      </div>
      
      {/* AI 분석 결과 (있는 경우) */}
      {analytics.aiSummary && (
        <AiAnalysisView analysis={analytics.aiSummary} />
      )}
      
      <div className="results-content">
        <h2 className="section-title">질문별 결과</h2>
        
        <div className="question-results">
          {analytics.questionStats.map((stat, index) => {
            const question = survey.questions.find(q => q.id === stat.questionId);
            if (!question) return null;
            
            return (
              <div key={stat.questionId} className="question-result-item">
                {renderQuestionResults(question, stat)}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="results-actions">
        <button onClick={() => navigate(`/survey/${id}`)} className="take-survey-button">
          설문 다시 참여하기
        </button>
        <button onClick={() => navigate('/survey')} className="back-button">
          설문 목록으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default SurveyResultPage;