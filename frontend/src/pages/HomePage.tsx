import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { PARTICIPATING_COUNTRIES } from '../data/participatingCountries';

const HomePage: React.FC = () => {
  // Count by support type
  const combatCount = PARTICIPATING_COUNTRIES.filter(c => c.supportType === 'combat').length;
  const medicalCount = PARTICIPATING_COUNTRIES.filter(c => c.supportType === 'medical').length;
  const totalCount = combatCount + medicalCount; // Only combat and medical support countries
  
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
            <h2 className="section-title">주요 참전국</h2>
            <p className="section-subtitle">한국전쟁에 큰 기여를 한 주요 국가들</p>
          </div>
          
          <div className="featured-countries">
            {PARTICIPATING_COUNTRIES
              .filter(country => country.supportType === 'combat' || country.supportType === 'medical')
              .slice(0, 6).map(country => (
              <Link to={`/countries/${country.id}`} key={country.id} className="featured-country">
                <img 
                  src={`https://flagcdn.com/w80/${country.flagCode}.png`}
                  srcSet={`https://flagcdn.com/w160/${country.flagCode}.png 2x`}
                  width="80" 
                  alt={`${country.nameEn} flag`} 
                  className="featured-flag"
                />
                <h3 className="featured-name">{country.nameKo}</h3>
                <p className="featured-type">
                  {country.supportType === 'combat' && '전투병 파병'}
                  {country.supportType === 'medical' && '의료 지원'}
                </p>
              </Link>
            ))}
          </div>
          
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