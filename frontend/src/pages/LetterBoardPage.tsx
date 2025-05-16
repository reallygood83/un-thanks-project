import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PARTICIPATING_COUNTRIES } from '../data/participatingCountries';
import { getLetters } from '../utils/api';
import './LetterBoardPage.css';

interface Letter {
  id: string;
  name: string;
  school: string;
  grade: string;
  letterContent: string;
  countryId: string;
  createdAt: string;
}

const LetterBoardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const countryIdParam = searchParams.get('country');
  
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState(countryIdParam || 'all');
  
  // 컴포넌트 마운트 시 또는 국가 ID 변경 시 편지 목록 가져오기
  useEffect(() => {
    const fetchLetters = async () => {
      try {
        setLoading(true);
        const countryFilter = selectedCountryId === 'all' ? undefined : selectedCountryId;
        const response = await getLetters(countryFilter);
        
        if (response.success) {
          setLetters(response.data);
        } else {
          throw new Error(response.error);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('편지 목록 조회 오류:', err);
        setError('편지 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };
    
    fetchLetters();
  }, [selectedCountryId]);
  
  // 국가 필터 변경 처리
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountryId = e.target.value;
    setSelectedCountryId(newCountryId);
    
    // URL 쿼리 파라미터 업데이트
    if (newCountryId === 'all') {
      searchParams.delete('country');
    } else {
      searchParams.set('country', newCountryId);
    }
    setSearchParams(searchParams);
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // 국가 ID로 국가 이름 가져오기
  const getCountryName = (countryId: string) => {
    const country = PARTICIPATING_COUNTRIES.find(c => c.id === countryId);
    return country ? country.nameKo : '알 수 없는 국가';
  };
  
  return (
    <div className="letter-board-page">
      <div className="container">
        <h1 className="page-title">감사 편지 게시판</h1>
        <p className="page-subtitle">
          참전국에 보내는 감사의 마음을 공유하는 공간입니다. 학생들이 작성한 편지를 볼 수 있습니다.
        </p>
        
        <div className="letter-filters">
          <div className="country-filter">
            <label htmlFor="countryFilter">국가별 보기:</label>
            <select 
              id="countryFilter" 
              value={selectedCountryId} 
              onChange={handleCountryChange}
              className="country-select"
            >
              <option value="all">모든 국가</option>
              {PARTICIPATING_COUNTRIES
                .filter(country => country.supportType === 'combat' || country.supportType === 'medical')
                .map(country => (
                <option key={country.id} value={country.id}>
                  {country.nameKo}
                </option>
              ))}
            </select>
          </div>
          
          <Link to="/write-letter" className="btn btn-primary">
            편지 작성하기
          </Link>
          <Link to="/letters/admin" className="btn btn-admin">
            관리자 페이지
          </Link>
        </div>
        
        {loading ? (
          <div className="loading-state">편지 목록을 불러오는 중...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : letters.length === 0 ? (
          <div className="empty-state">
            <p>아직 작성된 편지가 없습니다.</p>
            <p>첫 번째 편지를 작성해 보세요!</p>
            <Link to="/write-letter" className="btn">
              편지 작성하기
            </Link>
          </div>
        ) : (
          <div className="letters-list">
            {letters.map(letter => (
              <div key={letter.id} className="letter-card">
                <div className="letter-header">
                  <div className="letter-meta">
                    <h3 className="letter-author">{letter.name}</h3>
                    <div className="letter-details">
                      {letter.school && <span className="school">{letter.school}</span>}
                      {letter.grade && <span className="grade">{letter.grade}</span>}
                      <span className="date">{formatDate(letter.createdAt)}</span>
                    </div>
                  </div>
                  <div className="letter-country">
                    <span>To: </span>
                    <Link to={`/countries/${letter.countryId}`}>
                      <img 
                        src={`https://flagcdn.com/w40/${PARTICIPATING_COUNTRIES.find(c => c.id === letter.countryId)?.flagCode || 'un'}.png`}
                        alt={getCountryName(letter.countryId)}
                        className="country-flag-small"
                      />
                      <span>{getCountryName(letter.countryId)}</span>
                    </Link>
                  </div>
                </div>
                
                <div className="letter-content">
                  <p>{letter.letterContent}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LetterBoardPage;