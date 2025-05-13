import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 현재 어떤 프로젝트 영역에 있는지 확인
  const isUNICON = location.pathname === '/';
  const isThanksProject = location.pathname.includes('/thanks-project') || 
                         location.pathname.includes('/countries') || 
                         location.pathname.includes('/letters');
  const isSurveyProject = location.pathname.includes('/survey');
  
  // 현재 컨텍스트에 따라 로고 텍스트 결정
  const getLogoText = () => {
    if (isSurveyProject) return '미래로 AI 설문';
    if (isThanksProject) return '6.25 UN 참전국 감사 프로젝트';
    return 'UNICON';
  };
  
  // 현재 컨텍스트에 따라 로고 링크 결정
  const getLogoLink = () => {
    if (isSurveyProject) return '/survey';
    if (isThanksProject) return '/thanks-project';
    return '/';
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to={getLogoLink()}>
              <h1>{getLogoText()}</h1>
            </Link>
          </div>
          
          <div className="mobile-menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <ul className="nav-list">
              {/* UNICON 메인 - 항상 표시 */}
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={`unicon-link ${isUNICON ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  UNICON 메인
                </Link>
              </li>
              
              {/* 6.25 UN 감사 프로젝트 관련 링크 */}
              {(isThanksProject || !isSurveyProject) && (
                <>
                  <li className="nav-item">
                    <Link 
                      to="/thanks-project" 
                      className={location.pathname === '/thanks-project' ? 'active' : ''}
                      onClick={() => setMenuOpen(false)}
                    >
                      감사 프로젝트 홈
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/countries" 
                      className={location.pathname.includes('/countries') ? 'active' : ''}
                      onClick={() => setMenuOpen(false)}
                    >
                      참전국 정보
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/letters" 
                      className={location.pathname === '/letters' ? 'active' : ''}
                      onClick={() => setMenuOpen(false)}
                    >
                      감사 편지 게시판
                    </Link>
                  </li>
                </>
              )}
              
              {/* 미래로 AI 설문 관련 링크 */}
              <li className="nav-item">
                <Link 
                  to="/survey" 
                  className={`survey-link ${isSurveyProject ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  미래로 AI 설문
                </Link>
              </li>
              
              {/* 프로젝트 소개 - 항상 표시 */}
              <li className="nav-item">
                <Link 
                  to="/about" 
                  className={location.pathname === '/about' ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  프로젝트 소개
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;