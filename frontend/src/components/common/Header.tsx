import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/thanks-project">
              <h1>6.25 UN 참전국 감사 프로젝트</h1>
            </Link>
          </div>
          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link 
                  to="/thanks-project" 
                  className={location.pathname === '/thanks-project' ? 'active' : ''}
                >
                  홈
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/" 
                  className="unicon-link"
                >
                  UNICON 메인
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/countries" 
                  className={location.pathname.includes('/countries') ? 'active' : ''}
                >
                  참전국 정보
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/about" 
                  className={location.pathname === '/about' ? 'active' : ''}
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