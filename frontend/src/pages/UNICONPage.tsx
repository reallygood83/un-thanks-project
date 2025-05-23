import React from 'react';
import { Link } from 'react-router-dom';
import './UNICONPage.css';

const UNICONPage: React.FC = () => {
  return (
    <div className="unicon-page">
      <div className="container">
        <div className="unicon-header">
          <h1 className="unicon-title">UNICON</h1>
          <p className="unicon-subtitle">Unification + Contents</p>
          <p className="unicon-description">통일 교육과 한반도 평화를 위한 컨텐츠 허브</p>
        </div>
        
        <div className="unicon-content">
          <div className="project-grid">
            {/* 통일교육주간 프로젝트 카드 */}
            <a 
              href="https://uniweek2025.com/dailyevents/tuesday" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-card"
            >
              <div className="card-image uniweek-bg">
                <div className="card-overlay">
                  <h3>통일교육주간</h3>
                  <p>제13회 통일교육주간 (5월 19일~23일) 행사 안내</p>
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">통일교육주간</h3>
                <p className="card-description">남북 평화와 통일에 대한 국민적 공감대를 형성하고, 미래세대의 통일인식을 제고하기 위한 제13회 통일교육주간(5월 19일~23일) 프로그램</p>
                <div className="card-cta">
                  <span className="cta-text">웹사이트 방문하기</span>
                  <span className="cta-icon">→</span>
                </div>
              </div>
            </a>
            
            {/* 6.25 UN 참전국 감사 프로젝트 카드 */}
            <Link to="/thanks-project" className="project-card">
              <div className="card-image thanks-project-bg">
                <div className="card-overlay">
                  <h3>6.25 UN 참전국 감사 프로젝트</h3>
                  <p>한국전쟁 참전국에 대한 감사의 마음을 전합니다</p>
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">6.25 UN 참전국 감사 프로젝트</h3>
                <p className="card-description">6.25 한국전쟁 당시 대한민국의 자유와 평화를 위해 도움을 준 참전국들에 감사의 마음을 전하는 프로젝트</p>
                <div className="card-cta">
                  <span className="cta-text">프로젝트 보기</span>
                  <span className="cta-icon">→</span>
                </div>
              </div>
            </Link>
            
            {/* 미래로 AI 설문 프로젝트 카드 */}
            <Link to="/survey" className="project-card">
              <div className="card-image ai-survey-bg">
                <div className="card-overlay">
                  <h3>미래로 AI 설문</h3>
                  <p>AI가 분석하는 미래 통일 한국에 대한 설문조사</p>
                </div>
              </div>
              <div className="card-content">
                <h3 className="card-title">미래로 AI 설문</h3>
                <p className="card-description">미래 통일 한국의 모습에 대한 여러분의 생각을 설문으로 남겨주세요. AI가 분석한 결과를 확인할 수 있습니다.</p>
                <div className="card-cta">
                  <span className="cta-text">설문 참여하기</span>
                  <span className="cta-icon">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="unicon-footer">
          <p>© 2025 UNICON - 통일 컨텐츠 허브. All rights reserved.</p>
          <p className="creator-info">2025 안양 박달초 김문정</p>
        </div>
      </div>
    </div>
  );
};

export default UNICONPage;