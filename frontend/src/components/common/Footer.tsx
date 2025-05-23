import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>6.25 UN 참전국 감사 프로젝트</h3>
            <p>통일 교육의 일환으로 유엔 참전국에 감사의 마음을 전하는 프로젝트입니다.</p>
          </div>
          <div className="footer-section">
            <h3>관련 기관</h3>
            <ul>
              <li><a href="https://mpva.go.kr/" target="_blank" rel="noopener noreferrer">국가보훈부</a></li>
              <li><a href="https://www.uniedu.go.kr/" target="_blank" rel="noopener noreferrer">국립통일교육원</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 안양 박달초. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;