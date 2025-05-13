import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PARTICIPATING_COUNTRIES, ParticipatingCountry } from '../../data/participatingCountries';
import './LetterForm.css';

interface LetterFormProps {
  countryId: string;
}

// 편지 템플릿 데이터
const letterTemplates = [
  {
    id: 'thankful',
    label: '감사 표현',
    text: '존경하는 [국가명] 참전용사 및 국민 여러분께,\n\n6.25 전쟁 당시 대한민국의 자유와 평화를 위해 먼 이국땅까지 와서 싸워주신 것에 깊은 감사를 드립니다. 여러분의 희생과 용기가 없었다면, 오늘날의 대한민국은 존재하지 않았을 것입니다.\n\n진심으로 감사드립니다.'
  },
  {
    id: 'friendship',
    label: '우정 강조',
    text: '친애하는 [국가명] 친구들에게,\n\n6.25 전쟁은 우리 두 나라 사이에 피로 맺어진 우정의 시작이었습니다. 그 전쟁에서 보여주신 용기와 연대는 오늘날까지 이어지는 우리 관계의 기초가 되었습니다.\n\n앞으로도 [국가명]과 대한민국의 우정이 더욱 깊어지길 바랍니다.'
  },
  {
    id: 'history',
    label: '역사 교훈',
    text: '존경하는 [국가명] 참전용사 및 국민 여러분께,\n\n6.25 전쟁은 우리에게 평화의 소중함과 자유를 지키기 위한 노력의 중요성을 가르쳐주었습니다. [국가명]이 보여준, 정의를 위해 싸울 수 있는 용기는 제가 역사에서 배운 가장 값진 교훈입니다.\n\n그 희생을 절대 잊지 않겠습니다.'
  },
  {
    id: 'future',
    label: '미래 협력',
    text: '친애하는 [국가명] 국민 여러분,\n\n6.25 전쟁에서의 협력을 넘어, 이제 우리는 함께 더 밝은 미래를 향해 나아가고 있습니다. 한국과 [국가명]은 평화, 기술, 문화 등 다양한 분야에서 협력하며 더 나은 세계를 만들어 가고 있습니다.\n\n함께 만들어갈 미래가 기대됩니다.'
  }
];

const LetterForm: React.FC<LetterFormProps> = ({ countryId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [translationPreview, setTranslationPreview] = useState('');
  const [country, setCountry] = useState<ParticipatingCountry | null>(null);
  
  const navigate = useNavigate();
  
  // 국가 정보 로드
  useEffect(() => {
    const selectedCountry = PARTICIPATING_COUNTRIES.find(c => c.id === countryId);
    if (selectedCountry) {
      setCountry(selectedCountry);
    }
  }, [countryId]);
  
  // 번역 미리보기 (실제로는 API 연동 필요)
  useEffect(() => {
    if (letterContent.length > 10) {
      // 실제 구현에서는 API 호출
      const mockTranslation = `[번역된 내용이 여기에 표시됩니다]\n\n${letterContent.substring(0, 50)}...`;
      setTranslationPreview(mockTranslation);
    } else {
      setTranslationPreview('');
    }
  }, [letterContent]);
  
  // 템플릿 적용
  const applyTemplate = (templateId: string) => {
    const template = letterTemplates.find(t => t.id === templateId);
    if (template && country) {
      const filledTemplate = template.text.replace('[국가명]', country.nameKo);
      setLetterContent(filledTemplate);
    }
  };
  
  // 편지 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!country) return;
    
    setIsSubmitting(true);
    
    try {
      // API 호출
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          school,
          grade,
          letterContent,
          countryId,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 성공 시 편지 상세 페이지로 이동
        navigate(`/letters/${data.data.id}`);
      } else {
        alert(`제출 중 오류가 발생했습니다: ${data.message}`);
      }
    } catch (error) {
      console.error('편지 제출 오류:', error);
      alert('서버 연결 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!country) {
    return <div>국가 정보를 불러오는 중입니다...</div>;
  }
  
  return (
    <div className="letter-form-container">
      <div className="letter-form-header">
        <h2>6.25 UN 참전국 감사 편지</h2>
        <p>한국전쟁 당시 자유와 평화를 위해 싸워준 참전국에 감사의 마음을 전해보세요.</p>
        
        <div className="country-flag-container">
          <img 
            src={`https://flagcdn.com/w160/${country.flagCode.toLowerCase()}.png`} 
            alt={`${country.nameKo} flag`} 
          />
          <h3>{country.nameKo}에 보내는 편지</h3>
        </div>
      </div>
      
      <form className="letter-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">이메일 *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="school">학교</label>
            <input
              type="text"
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="grade">학년</label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
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
              <option value="교사">교사</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>
        
        <div className="letter-templates">
          <h4>편지 템플릿을 선택해보세요</h4>
          <div className="template-buttons">
            {letterTemplates.map(template => (
              <button
                key={template.id}
                type="button"
                className="template-button"
                onClick={() => applyTemplate(template.id)}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="letterContent">편지 내용 *</label>
          <textarea
            id="letterContent"
            value={letterContent}
            onChange={(e) => setLetterContent(e.target.value)}
            placeholder={`${country.nameKo}에 보내는 감사의 마음을 담아 편지를 작성해보세요.`}
            required
          ></textarea>
        </div>
        
        {translationPreview && (
          <div className="translation-preview">
            <h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              번역 미리보기
            </h4>
            <p>{translationPreview}</p>
          </div>
        )}
        
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? '제출 중...' : '편지 보내기'}
        </button>
        
        <p className="form-note">
          * 작성한 편지는 자동으로 {country.nameKo} 언어로 번역되어 전달됩니다.
        </p>
      </form>
    </div>
  );
};

export default LetterForm;