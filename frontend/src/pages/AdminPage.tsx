import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyApi } from '../api/surveyApi';
import { Survey } from '../types/survey';
import './AdminPage.css';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [deletingSurveyId, setDeletingSurveyId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSurveys();
    }
  }, [isAuthenticated]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await surveyApi.getAllSurveys();
      setSurveys(data);
    } catch (err) {
      setError('설문 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === '19500625') {
      setIsAuthenticated(true);
      setShowPasswordForm(false);
    } else {
      alert('잘못된 비밀번호입니다.');
      setPassword('');
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (window.confirm('정말로 이 설문을 삭제하시겠습니까?')) {
      try {
        setDeletingSurveyId(surveyId);
        // 관리자 비밀번호로 강제 삭제
        const success = await surveyApi.deleteSurvey(surveyId, '19500625');
        
        if (success) {
          alert('설문이 성공적으로 삭제되었습니다.');
          fetchSurveys(); // 목록 새로고침
        } else {
          alert('설문 삭제에 실패했습니다.');
        }
      } catch (err) {
        console.error('Error deleting survey:', err);
        alert('설문 삭제 중 오류가 발생했습니다.');
      } finally {
        setDeletingSurveyId(null);
      }
    }
  };

  if (showPasswordForm && !isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="password-form-container">
          <h2>관리자 액세스</h2>
          <p>관리자 페이지에 접근하기 위해 비밀번호를 입력해주세요.</p>
          
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
                onClick={() => navigate('/survey')}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>설문 목록을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>설문 관리자 페이지</h1>
        <button onClick={() => navigate('/survey')} className="back-button">
          돌아가기
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-notice">
        <p>🔐 관리자 권한으로 로그인되었습니다. 모든 설문을 강제 삭제할 수 있습니다.</p>
      </div>

      <div className="surveys-list">
        <h2>설문 목록</h2>
        {surveys.length === 0 ? (
          <p className="no-surveys">등록된 설문이 없습니다.</p>
        ) : (
          <table className="surveys-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>설명</th>
                <th>생성일</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr key={survey._id || survey.id}>
                  <td>{survey.title}</td>
                  <td>{survey.description}</td>
                  <td>{new Date(survey.createdAt || '').toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${survey.isActive ? 'active' : 'inactive'}`}>
                      {survey.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/survey/${survey._id || survey.id}/results`)}
                        className="view-button"
                      >
                        결과보기
                      </button>
                      <button
                        onClick={() => navigate(`/survey/${survey._id || survey.id}`)}
                        className="preview-button"
                      >
                        미리보기
                      </button>
                      <button
                        onClick={() => handleDeleteSurvey(survey._id || survey.id || '')}
                        className="delete-button"
                        disabled={deletingSurveyId === (survey._id || survey.id)}
                      >
                        {deletingSurveyId === (survey._id || survey.id) ? '삭제 중...' : '삭제'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;