import React from 'react';
import './CountryFilter.css';

export type SupportType = 'all' | 'combat' | 'medical' | 'material' | 'intent';

interface CountryFilterProps {
  selectedType: SupportType;
  onTypeChange: (type: SupportType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CountryFilter: React.FC<CountryFilterProps> = ({
  selectedType,
  onTypeChange,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="country-filter">
      <div className="filter-section">
        <h3>참전 유형별 보기</h3>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => onTypeChange('all')}
          >
            전체
          </button>
          <button 
            className={`filter-btn ${selectedType === 'combat' ? 'active' : ''}`}
            onClick={() => onTypeChange('combat')}
          >
            전투병 파병국
          </button>
          <button 
            className={`filter-btn ${selectedType === 'medical' ? 'active' : ''}`}
            onClick={() => onTypeChange('medical')}
          >
            의료 지원국
          </button>
          <button 
            className={`filter-btn ${selectedType === 'material' ? 'active' : ''}`}
            onClick={() => onTypeChange('material')}
          >
            물자 지원국
          </button>
          <button 
            className={`filter-btn ${selectedType === 'intent' ? 'active' : ''}`}
            onClick={() => onTypeChange('intent')}
          >
            지원 의사 표명국
          </button>
        </div>
      </div>
      
      <div className="search-section">
        <h3>국가 검색</h3>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="국가 이름을 입력하세요"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-button"
              onClick={() => onSearchChange('')}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryFilter;