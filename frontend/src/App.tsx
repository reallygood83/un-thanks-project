import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import UNICONPage from './pages/UNICONPage';
import HomePage from './pages/HomePage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import LetterFormPage from './pages/LetterFormPage';
import LetterBoardPage from './pages/LetterBoardPage';
import AboutPage from './pages/AboutPage';
import SurveyListPage from './pages/SurveyListPage';

const App: React.FC = () => {
  const location = useLocation();
  
  // 현재 메인 허브 페이지(UNICON)인지 확인
  const isMainHub = location.pathname === '/';
  
  // UNICON 메인 허브 페이지에서는 헤더와 푸터를 숨김
  return (
    <div className="app">
      {!isMainHub && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<UNICONPage />} />
          <Route path="/thanks-project" element={<HomePage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/countries/:countryId" element={<CountryDetailPage />} />
          <Route path="/write-letter/:countryId" element={<LetterFormPage />} />
          <Route path="/write-letter" element={<CountriesPage />} />
          <Route path="/letters" element={<LetterBoardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/survey" element={<SurveyListPage />} />
        </Routes>
      </main>
      {!isMainHub && <Footer />}
    </div>
  );
};

export default App;