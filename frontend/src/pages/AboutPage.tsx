import React from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1 className="page-title">6.25 UN 참전국 감사 프로젝트 소개</h1>
        <div className="project-image-container">
          <img 
            src="/images/un_korea_peace.svg" 
            alt="UN 한반도 평화 이미지" 
            className="project-image" 
          />
        </div>
        
        <div className="about-container">
          <section className="about-section">
            <h2 className="section-heading">프로젝트 개요</h2>
            <p>
              6.25 UN 참전국 감사 프로젝트는 한국전쟁 당시 유엔 참전국들의 숭고한 희생과 헌신을 올바르게 이해하고, 
              이에 대한 진심 어린 감사와 존경의 마음을 갖도록 하는 통일 교육 프로그램입니다.
            </p>
            <p>
              단순히 역사적 사실을 암기하는 것을 넘어, 학생들이 참전 용사들의 인류애적 결단과 국제 사회의 연대가 지닌 가치를 
              마음 깊이 새기도록 하는 데 중점을 둡니다. 학생들은 참전국에 대한 정보를 학습하고, 감사 편지를 작성하여 
              해당 국가의 언어로 번역된 편지를 참전국 대사관이나 관련 기관에 전달합니다.
            </p>
          </section>
          
          <section className="about-section">
            <h2 className="section-heading">교육 목표</h2>
            <div className="goals-grid">
              <div className="goal-card">
                <div className="goal-icon">🌍</div>
                <h3>국제 연대 의식 함양</h3>
                <p>
                  6.25 전쟁 당시 국제 사회의 지원이 없었다면 대한민국의 자유와 민주주의를 지켜내기 어려웠을 것이라는 
                  역사적 사실을 통해, 국제 협력과 연대의 중요성을 체감합니다.
                </p>
              </div>
              <div className="goal-card">
                <div className="goal-icon">🕊️</div>
                <h3>평화와 통일 의식 고취</h3>
                <p>
                  전쟁의 참혹함과 그로 인한 분단의 고통을 상기시키는 것은 평화의 소중함을 절실히 깨닫게 합니다. 
                  한반도의 평화 구축과 통일을 위한 국제 사회와의 협력의 중요성을 이해합니다.
                </p>
              </div>
              <div className="goal-card">
                <div className="goal-icon">🙏</div>
                <h3>감사와 존중의 마음 함양</h3>
                <p>
                  참전 용사들과 참전국 국민들의 고귀한 희생과 헌신이 있었기에 오늘날의 대한민국이 존재할 수 있음을 깨닫고, 
                  이에 대한 진심 어린 감사의 마음을 갖습니다.
                </p>
              </div>
              <div className="goal-card">
                <div className="goal-icon">🤝</div>
                <h3>글로벌 시민 의식 함양</h3>
                <p>
                  '받은 도움을 기억하고 보답하는' 상호주의적 국제 관계의 기본 원리를 체득하여, 
                  미래 통일 한국의 시민으로서 국제사회에 기여하고 책임을 다하는 성숙한 자세를 갖춥니다.
                </p>
              </div>
            </div>
          </section>
          
          <section className="about-section">
            <h2 className="section-heading">참여 방법</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>참전국 정보 살펴보기</h3>
                  <p>67개 참전국의 상세 정보와 한국전쟁 당시 기여 내용을 살펴봅니다.</p>
                  <Link to="/countries" className="step-link">참전국 정보 보기</Link>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>감사 편지 작성하기</h3>
                  <p>선택한 참전국에 감사의 마음을 담은 편지를 작성합니다.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>번역 및 전송</h3>
                  <p>작성한 편지는 해당 국가의 언어로 자동 번역되어 관련 기관에 전송됩니다.</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="about-section">
            <h2 className="section-heading">참여 대상</h2>
            <p>
              본 프로젝트는 초, 중, 고등학교 학생들을 주요 대상으로 하지만, 남녀노소 누구나 참여할 수 있습니다. 
              특히 학교 교육 현장에서 사회, 역사, 도덕 교과와 연계하여 활용할 수 있도록 다양한 교육 자료를 제공합니다.
            </p>
          </section>
          
          <div className="about-actions">
            <Link to="/countries" className="btn btn-large">
              참전국 정보 살펴보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;