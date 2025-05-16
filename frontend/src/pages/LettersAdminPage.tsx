import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { letterApi } from '../api/letterApi';
import { Letter } from '../types/letter';
import './LettersAdminPage.css';

const LettersAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [deletingLetterId, setDeletingLetterId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLetters();
    }
  }, [isAuthenticated]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const data = await letterApi.getAllLetters();
      setLetters(data);
    } catch (err) {
      setError('편지 목록을 불러오는데 실패했습니다.');
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

  const handleDeleteLetter = async (letterId: string) => {
    if (window.confirm('정말로 이 편지를 삭제하시겠습니까?')) {
      try {
        setDeletingLetterId(letterId);
        // 관리자 비밀번호로 강제 삭제
        const success = await letterApi.deleteLetter(letterId, '19500625');
        
        if (success) {
          alert('편지가 성공적으로 삭제되었습니다.');
          fetchLetters(); // 목록 새로고침
        } else {
          alert('편지 삭제에 실패했습니다.');
        }
      } catch (err) {
        console.error('Error deleting letter:', err);
        alert('편지 삭제 중 오류가 발생했습니다.');
      } finally {
        setDeletingLetterId(null);
      }
    }
  };

  if (showPasswordForm && !isAuthenticated) {
    return (
      <div className="letters-admin-page">
        <div className="password-form-container">
          <h2>관리자 액세스</h2>
          <p>편지 관리자 페이지에 접근하기 위해 비밀번호를 입력해주세요.</p>
          
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
                onClick={() => navigate('/letters')}
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
      <div className="letters-admin-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>편지 목록을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="letters-admin-page">
      <div className="admin-header">
        <h1>편지 관리자 페이지</h1>
        <button onClick={() => navigate('/letters')} className="back-button">
          돌아가기
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-notice">
        <p>🔐 관리자 권한으로 로그인되었습니다. 모든 편지를 강제 삭제할 수 있습니다.</p>
      </div>

      <div className="letters-list">
        <h2>편지 목록</h2>
        {letters.length === 0 ? (
          <p className="no-letters">등록된 편지가 없습니다.</p>
        ) : (
          <table className="letters-table">
            <thead>
              <tr>
                <th>작성자</th>
                <th>대상 국가</th>
                <th>제목</th>
                <th>작성일</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {letters.map((letter) => (
                <tr key={letter._id || letter.id}>
                  <td>{letter.author}</td>
                  <td>{letter.country}</td>
                  <td>{letter.title || '제목 없음'}</td>
                  <td>{new Date(letter.createdAt || '').toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${letter.approved ? 'approved' : 'pending'}`}>
                      {letter.approved ? '승인됨' : '대기중'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/letters/${letter._id || letter.id}`)}
                        className="view-button"
                      >
                        보기
                      </button>
                      <button
                        onClick={() => handleDeleteLetter(letter._id || letter.id || '')}
                        className="delete-button"
                        disabled={deletingLetterId === (letter._id || letter.id)}
                      >
                        {deletingLetterId === (letter._id || letter.id) ? '삭제 중...' : '삭제'}
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

export default LettersAdminPage;