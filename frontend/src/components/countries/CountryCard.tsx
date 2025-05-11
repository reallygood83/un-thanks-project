import React from 'react';
import { Link } from 'react-router-dom';
import { ParticipatingCountry } from '../../data/participatingCountries';
import './CountryCard.css';

interface CountryCardProps {
  country: ParticipatingCountry;
}

const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  // Function to get badge class based on support type
  const getBadgeClass = (supportType: string) => {
    switch (supportType) {
      case 'combat':
        return 'badge-combat';
      case 'medical':
        return 'badge-medical';
      case 'material':
        return 'badge-material';
      case 'intent':
        return 'badge-intent';
      default:
        return '';
    }
  };

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
    <div className="country-card card">
      <div className="country-card-header">
        <img 
          src={`https://flagcdn.com/w80/${country.flagCode}.png`} 
          srcSet={`https://flagcdn.com/w160/${country.flagCode}.png 2x`}
          width="40" 
          alt={`${country.nameEn} flag`} 
          className="country-flag"
        />
        <h3 className="country-name">
          {country.nameKo} <span className="country-name-en">{country.nameEn}</span>
          <span className={`badge ${getBadgeClass(country.supportType)}`}>
            {getSupportTypeText(country.supportType)}
          </span>
        </h3>
      </div>
      
      <div className="country-card-body">
        <p className="country-contribution">{country.contributions.substring(0, 100)}...</p>
        
        {country.troops && (
          <div className="country-stat">
            <span className="stat-label">파병 규모:</span> 
            <span className="stat-value">{country.troops.toLocaleString()}명</span>
          </div>
        )}
        
        {country.casualties && (
          <div className="country-stat">
            <span className="stat-label">사상자:</span> 
            <span className="stat-value">{country.casualties.killed.toLocaleString()}명</span>
          </div>
        )}
      </div>
      
      <div className="country-card-footer">
        <Link to={`/countries/${country.id}`} className="btn">
          자세히 보기
        </Link>
        
        <Link to={`/write-letter/${country.id}`} className="btn btn-secondary">
          감사 편지 쓰기
        </Link>
      </div>
    </div>
  );
};

export default CountryCard;