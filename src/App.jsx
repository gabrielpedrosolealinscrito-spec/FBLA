import React, { useState, useEffect } from 'react';
import Potential from './screens/PotentialApp.jsx';
import FinancialsView from './screens/FinancialsView.jsx';
import SlideModel from './screens/financials/SlideModel.jsx';
import SlideLtv from './screens/financials/SlideLtv.jsx';

// Lightweight hash routing — keeps the main app untouched while exposing
// the Financials screen at #/financials (in-app view + deck screenshot source).
export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  if (hash.startsWith('#/financials/model')) return <SlideModel />;
  if (hash.startsWith('#/financials/ltv')) return <SlideLtv />;
  if (hash.startsWith('#/financials')) return <FinancialsView />;
  return <Potential />;
}
