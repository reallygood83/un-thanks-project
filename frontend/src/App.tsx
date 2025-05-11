import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import LetterFormPage from './pages/LetterFormPage';
import AboutPage from './pages/AboutPage';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/countries/:countryId" element={<CountryDetailPage />} />
          <Route path="/write-letter/:countryId" element={<LetterFormPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;