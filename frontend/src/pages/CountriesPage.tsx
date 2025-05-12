import React, { useState, useMemo } from 'react';
import CountryCard from '../components/countries/CountryCard';
import CountryFilter, { SupportType } from '../components/countries/CountryFilter';
import { PARTICIPATING_COUNTRIES } from '../data/participatingCountries';
import './CountriesPage.css';

const CountriesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<SupportType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter countries based on selected type and search term
  const filteredCountries = useMemo(() => {
    return PARTICIPATING_COUNTRIES.filter(country => {
      // Only include combat and medical support countries
      const supportTypeMatch = country.supportType === 'combat' || country.supportType === 'medical';
      
      // Filter by type
      const typeMatch = selectedType === 'all' || country.supportType === selectedType;
      
      // Filter by search term
      const searchMatch = searchTerm === '' || 
        country.nameKo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
      
      return supportTypeMatch && typeMatch && searchMatch;
    });
  }, [selectedType, searchTerm]);
  
  return (
    <div className="countries-page">
      <div className="container">
        <h1 className="page-title">6.25 UN 참전국 정보</h1>
        
        <CountryFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        {filteredCountries.length > 0 ? (
          <div className="countries-grid">
            {filteredCountries.map(country => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h2>검색 결과가 없습니다</h2>
            <p>다른 검색어나 필터를 시도해보세요.</p>
            <button 
              className="btn"
              onClick={() => {
                setSelectedType('all');
                setSearchTerm('');
              }}
            >
              모든 참전국 보기
            </button>
          </div>
        )}
        
        <div className="countries-info">
          <h3>UN 참전국 현황</h3>
          <p>
            6.25 전쟁 당시 대한민국의 자유와 평화를 수호하기 위해 유엔의 깃발 아래 전투병 파병과 의료 지원으로 연대한 국가들이 있습니다.
            이들 국가는 대한민국의 생존과 재건을 위해 큰 희생을 감내했습니다.
          </p>
          <ul>
            <li><strong>전투병 파병국 (16개국):</strong> 미국, 영국, 캐나다, 터키, 호주, 필리핀, 태국, 네덜란드, 콜롬비아, 그리스, 뉴질랜드, 프랑스, 에티오피아, 벨기에, 남아프리카 연방, 룩셈부르크</li>
            <li><strong>의료 지원국 (6개국):</strong> 인도, 덴마크, 스웨덴, 노르웨이, 이탈리아, 독일(서독)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CountriesPage;