import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { PARTICIPATING_COUNTRIES, ParticipatingCountry } from '../data/participatingCountries';

// 대륙별 국가 분류 
type Continent = 'america' | 'asia' | 'europe' | 'africa' | 'oceania';

interface ContinentInfo {
  id: Continent;
  nameKo: string;
  nameEn: string;
  imageUrl: string;
  countries: ParticipatingCountry[];
}

const CONTINENT_INFO: Record<Continent, Omit<ContinentInfo, 'countries'>> = {
  america: {
    id: 'america',
    nameKo: '아메리카',
    nameEn: 'Americas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Americas_%28orthographic_projection%29.svg/550px-Americas_%28orthographic_projection%29.svg.png'
  },
  asia: {
    id: 'asia',
    nameKo: '아시아',
    nameEn: 'Asia',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Asia_%28orthographic_projection%29.svg/550px-Asia_%28orthographic_projection%29.svg.png'
  },
  europe: {
    id: 'europe',
    nameKo: '유럽',
    nameEn: 'Europe',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Europe_orthographic_Caucasus_Urals_boundary_%28with_borders%29.svg/550px-Europe_orthographic_Caucasus_Urals_boundary_%28with_borders%29.svg.png'
  },
  africa: {
    id: 'africa',
    nameKo: '아프리카',
    nameEn: 'Africa',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Africa_%28orthographic_projection%29.svg/550px-Africa_%28orthographic_projection%29.svg.png'
  },
  oceania: {
    id: 'oceania',
    nameKo: '오세아니아',
    nameEn: 'Oceania',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Oceania_%28orthographic_projection%29.svg/550px-Oceania_%28orthographic_projection%29.svg.png'
  }
};

// 국가별 대륙 정보 맵핑
const getCountryContinent = (countryId: string): Continent => {
  // 아메리카 국가
  if (['usa', 'canada', 'colombia'].includes(countryId)) {
    return 'america';
  }
  // 아시아 국가
  else if (['philippines', 'thailand', 'india'].includes(countryId)) {
    return 'asia';
  }
  // 유럽 국가
  else if (['uk', 'france', 'belgium', 'netherlands', 'luxembourg', 
            'greece', 'turkey', 'italy', 'sweden', 'denmark', 
            'norway', 'germany'].includes(countryId)) {
    return 'europe';
  }
  // 아프리카 국가
  else if (['south-africa', 'ethiopia'].includes(countryId)) {
    return 'africa';
  }
  // 오세아니아 국가
  else if (['australia', 'new-zealand'].includes(countryId)) {
    return 'oceania';
  }
  // 기본값
  return 'asia';
};

const HomePage: React.FC = () => {
  // Count by support type
  const combatCount = PARTICIPATING_COUNTRIES.filter(c => c.supportType === 'combat').length;
  const medicalCount = PARTICIPATING_COUNTRIES.filter(c => c.supportType === 'medical').length;
  const totalCount = combatCount + medicalCount; // Only combat and medical support countries
  
  // 대륙별 국가 분류
  const eligibleCountries = PARTICIPATING_COUNTRIES.filter(
    country => country.supportType === 'combat' || country.supportType === 'medical'
  );
  
  const continents: ContinentInfo[] = Object.values(CONTINENT_INFO).map(continent => ({
    ...continent,
    countries: eligibleCountries.filter(country => getCountryContinent(country.id) === continent.id)
  }));
  
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">6.25 UN 참전국 감사 프로젝트</h1>
            <p className="hero-subtitle">
              한국전쟁 당시 대한민국의 자유와 평화를 위해 전투병 파병 및 의료 지원을 제공한 국가들에 감사의 마음을 전합니다.
            </p>
            <div className="hero-buttons">
              <Link to="/countries" className="btn btn-hero">
                참전국 정보 보기
              </Link>
              <Link to="/about" className="btn btn-hero btn-hero-secondary">
                프로젝트 소개
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="stats-section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">참전국 현황</h2>
            <p className="section-subtitle">6.25 전쟁 당시 국제사회의 지원 규모와 다양성</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{totalCount}</div>
              <div className="stat-label">총 참전국</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{combatCount}</div>
              <div className="stat-label">전투병 파병국</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{medicalCount}</div>
              <div className="stat-label">의료 지원국</div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="featured-countries-section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2 className="section-title">세계 각국의 지원</h2>
            <p className="section-subtitle">전 세계가 대한민국의 자유와 평화를 위해 연대했습니다</p>
          </div>
          
          <div className="continent-message">
            <h3>전 세계가 대한민국을 위해 힘을 모았습니다</h3>
            <p>6.25 전쟁 당시 5개 대륙 22개국이 전투병 파병과 의료 지원으로 대한민국의 자유와 평화를 수호했습니다. 우리는 세계시민으로서 이들의 헌신과 희생을 기억하고 감사해야 합니다.</p>
          </div>
          
          {continents.map(continent => (
            <div key={continent.id} className="continent-section">
              <div className="continent-header">
                <div className="continent-image">
                  <img 
                    src={continent.imageUrl} 
                    alt={`${continent.nameEn} continent`} 
                    className="continent-map"
                  />
                </div>
                <div className="continent-info">
                  <h3 className="continent-name">{continent.nameKo}</h3>
                  <p className="continent-count">{continent.countries.length}개국 참전</p>
                </div>
              </div>
              
              <div className="continent-countries">
                {continent.countries.map(country => (
                  <Link to={`/countries/${country.id}`} key={country.id} className="continent-country">
                    <img 
                      src={`https://flagcdn.com/w80/${country.flagCode}.png`}
                      srcSet={`https://flagcdn.com/w160/${country.flagCode}.png 2x`}
                      width="50" 
                      alt={`${country.nameEn} flag`} 
                      className="country-flag"
                    />
                    <div className="country-info">
                      <h4 className="country-name">{country.nameKo}</h4>
                      <p className="country-type">
                        {country.supportType === 'combat' && '전투병 파병'}
                        {country.supportType === 'medical' && '의료 지원'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          
          <div className="featured-cta">
            <Link to="/countries" className="btn btn-large">
              모든 참전국 정보 보기
            </Link>
          </div>
        </div>
      </section>
      
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">프로젝트 소개</h2>
              <p>
                6.25 UN 참전국 감사 프로젝트는 한국전쟁 당시 유엔 참전국들의 숭고한 희생과 헌신을 기억하고, 
                이에 대한 감사의 마음을 전하기 위한 교육 프로그램입니다. 
              </p>
              <p>
                학생들은 참전국들에 대한 역사적 이해를 바탕으로 감사 편지를 작성하고, 
                이를 통해 국제 연대의 중요성을 인식하며 평화와 통일에 대한 긍정적인 인식을 함양할 수 있습니다.
              </p>
              <Link to="/about" className="btn">
                더 알아보기
              </Link>
            </div>
            <div className="about-image">
              {/* 이미지가 없으므로 제거하고 나중에 추가 */}
              <div className="placeholder-image">
                6.25 참전국 감사 프로젝트 이미지
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;