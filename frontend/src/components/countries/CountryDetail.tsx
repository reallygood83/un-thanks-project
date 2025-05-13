import React from 'react';
import { Link } from 'react-router-dom';
import { ParticipatingCountry } from '../../data/participatingCountries';
import './CountryDetail.css';

interface CountryDetailProps {
  country: ParticipatingCountry;
}

const CountryDetail: React.FC<CountryDetailProps> = ({ country }) => {
  // Function to get support type text in Korean
  const getSupportTypeText = (supportType: string) => {
    switch (supportType) {
      case 'combat':
        return '전투병 파병';
      case 'medical':
        return '의료 지원';
      case 'material':
        return '물자 지원';
      case 'intent':
        return '지원 의사';
      default:
        return '';
    }
  };
  
  return (
    <div className="country-detail">
      <div className="country-header">
        <div className="flag-container">
          <img 
            src={`https://flagcdn.com/w320/${country.flagCode}.png`}
            srcSet={`https://flagcdn.com/w640/${country.flagCode}.png 2x`}
            width="160" 
            alt={`${country.nameEn} flag`} 
            className="country-flag-large"
          />
        </div>
        
        <div className="country-title">
          <h2 className="country-name-large">{country.nameKo}</h2>
          <p className="country-name-en-large">{country.nameEn}</p>
          <span className={`badge badge-${country.supportType}`}>
            {getSupportTypeText(country.supportType)}
          </span>
        </div>
      </div>
      
      <div className="country-stats">
        {country.troops && (
          <div className="stat-card">
            <h3>파병 규모</h3>
            <p className="stat-value">{country.troops.toLocaleString()}명</p>
          </div>
        )}
        
        {country.period && (
          <div className="stat-card">
            <h3>참전 기간</h3>
            <p className="stat-value">{country.period.start} ~ {country.period.end}</p>
          </div>
        )}
        
        {country.casualties && (
          <div className="stat-card">
            <h3>사상자</h3>
            <p className="stat-value">
              전사/사망: {country.casualties.killed.toLocaleString()}명<br />
              부상: {country.casualties.wounded.toLocaleString()}명<br />
              실종/포로: {country.casualties.missing.toLocaleString()}명
            </p>
          </div>
        )}
      </div>
      
      <div className="country-sections">
        <section className="detail-section">
          <h3 className="section-title">주요 기여</h3>
          <p>{country.contributions}</p>
        </section>
        
        <section className="detail-section">
          <h3 className="section-title">참전 배경</h3>
          <p>{country.background}</p>
        </section>
        
        <section className="detail-section">
          <h3 className="section-title">한국과의 관계</h3>
          <p>{country.relationship}</p>
        </section>
      </div>
      
      <div className="country-actions">
        <Link to={`/write-letter/${country.id}`} className="btn btn-large btn-secondary">
          {country.nameKo}에 감사 편지 쓰기
        </Link>
        
        <Link to="/countries" className="btn btn-large">
          다른 참전국 보기
        </Link>
      </div>
    </div>
  );
};

export default CountryDetail;