import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CountryDetail from '../components/countries/CountryDetail';
import { PARTICIPATING_COUNTRIES } from '../data/participatingCountries';
import './CountryDetailPage.css';

const CountryDetailPage: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  
  // Find the country by ID
  const country = useMemo(() => {
    return PARTICIPATING_COUNTRIES.find(c => c.id === countryId);
  }, [countryId]);
  
  // If country not found, redirect to countries page
  if (!country) {
    return <Navigate to="/countries" />;
  }
  
  return (
    <div className="country-detail-page">
      <div className="container">
        <CountryDetail country={country} />
      </div>
    </div>
  );
};

export default CountryDetailPage;