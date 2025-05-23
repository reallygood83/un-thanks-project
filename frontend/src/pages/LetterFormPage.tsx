import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { PARTICIPATING_COUNTRIES } from '../data/participatingCountries';
import { submitLetter } from '../utils/api';
import './LetterFormPage.css';

const LetterFormPage: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  
  // Find the country by ID
  const country = useMemo(() => {
    return PARTICIPATING_COUNTRIES.find(c => c.id === countryId);
  }, [countryId]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    grade: '',
    letterContent: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!country) return;

    setIsSubmitting(true);

    try {
      // 데이터베이스에 편지 제출
      const response = await submitLetter({
        ...formData,
        countryId: country.id
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // 성공 상태 표시
      setHasSubmitted(true);
    } catch (error) {
      console.error('편지 제출 오류:', error);
      alert('편지 게시 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If country not found, redirect to countries page
  if (!country) {
    return <Navigate to="/countries" />;
  }
  
  return (
    <div className="letter-form-page">
      <div className="container">
        <div className="letter-form-container">
          <h1 className="page-title">{country.nameKo}에 감사 편지 쓰기</h1>
          
          {hasSubmitted ? (
            <div className="submission-success">
              <h2>감사 편지가 성공적으로 게시되었습니다!</h2>
              <div className="letter-content-preview">
                <h3>작성한 편지</h3>
                <p>{formData.letterContent}</p>
              </div>
              <div className="success-actions">
                <button 
                  className="btn"
                  onClick={() => navigate(`/countries/${country.id}`)}
                >
                  {country.nameKo} 정보로 돌아가기
                </button>
                <button 
                  className="btn"
                  onClick={() => navigate('/letters')}
                >
                  감사 편지 게시판 보기
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setFormData({
                      name: '',
                      school: '',
                      grade: '',
                      letterContent: ''
                    });
                    setHasSubmitted(false);
                  }}
                >
                  새 편지 작성하기
                </button>
              </div>
            </div>
          ) : (
            <form className="letter-form" onSubmit={handleSubmit}>
              <div className="country-recipient">
                <img 
                  src={`https://flagcdn.com/w80/${country.flagCode}.png`}
                  srcSet={`https://flagcdn.com/w160/${country.flagCode}.png 2x`}
                  width="40" 
                  alt={`${country.nameEn} flag`} 
                  className="country-flag-small"
                />
                <div>
                  <h3>받는 곳: {country.nameKo}</h3>
                  <p>작성한 편지는 감사 편지 게시판에 저장되며, 다른 학생들과 공유됩니다.</p>
                </div>
              </div>
              
              <div className="form-section">
                <h3>작성자 정보</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">이름 *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="school">학교</label>
                    <input
                      type="text"
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="grade">학년</label>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                    >
                      <option value="">선택하세요</option>
                      <option value="초등학교 1학년">초등학교 1학년</option>
                      <option value="초등학교 2학년">초등학교 2학년</option>
                      <option value="초등학교 3학년">초등학교 3학년</option>
                      <option value="초등학교 4학년">초등학교 4학년</option>
                      <option value="초등학교 5학년">초등학교 5학년</option>
                      <option value="초등학교 6학년">초등학교 6학년</option>
                      <option value="중학교 1학년">중학교 1학년</option>
                      <option value="중학교 2학년">중학교 2학년</option>
                      <option value="중학교 3학년">중학교 3학년</option>
                      <option value="고등학교 1학년">고등학교 1학년</option>
                      <option value="고등학교 2학년">고등학교 2학년</option>
                      <option value="고등학교 3학년">고등학교 3학년</option>
                      <option value="대학생">대학생</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>편지 내용 *</h3>
                <p className="form-tip">
                  {country.nameKo}에 보내는 감사의 마음을 담아 편지를 작성해주세요.
                </p>
                
                <div className="form-group">
                  <textarea
                    id="letterContent"
                    name="letterContent"
                    rows={10}
                    value={formData.letterContent}
                    onChange={handleChange}
                    placeholder={`${country.nameKo}에 참전해주셔서 감사합니다...`}
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '제출 중...' : '편지 보내기'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterFormPage;