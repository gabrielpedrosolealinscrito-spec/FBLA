import React, { useState, useEffect, useRef } from 'react';
import Potential from './screens/PotentialApp.jsx';
import FinancialsView from './screens/FinancialsView.jsx';
import SlideModel from './screens/financials/SlideModel.jsx';
import SlideLtv from './screens/financials/SlideLtv.jsx';
import Pricing from './screens/Pricing.jsx';
import ResultsMap from './screens/ResultsMap.jsx';
import LoginModal from './components/LoginModal.jsx';
import About from './screens/About.jsx';
import FAQ from './screens/FAQ.jsx';

// Dev/demo harness for the results map in isolation (#/map) — real lat/lng +
// engine-shaped financials so pins, the panel, and interactions can be checked
// without running the quiz.
const MAP_PREVIEW = {
  profile: { profession: 'Physical Therapist', hasRemote: true },
  results: [
    { name: 'Austin, TX', lat: 30.27, lng: -97.74, matchScore: 88, monthlyTakeHome: 5180, monthlySavings: 980, medianRent: 1650 },
    { name: 'Raleigh, NC', lat: 35.78, lng: -78.64, matchScore: 81, monthlyTakeHome: 4760, monthlySavings: 1180, medianRent: 1420 },
    { name: 'Denver, CO', lat: 39.74, lng: -104.99, matchScore: 79, monthlyTakeHome: 4980, monthlySavings: 640, medianRent: 1780 },
    { name: 'San Francisco, CA', lat: 37.77, lng: -122.42, matchScore: 77, monthlyTakeHome: 6120, monthlySavings: -120, medianRent: 2980 },
    { name: 'Chicago, IL', lat: 41.88, lng: -87.63, matchScore: 74, monthlyTakeHome: 4860, monthlySavings: 420, medianRent: 1740 },
    { name: 'Boston, MA', lat: 42.36, lng: -71.06, matchScore: 72, monthlyTakeHome: 5320, monthlySavings: 180, medianRent: 2620 },
    { name: 'Seattle, WA', lat: 47.61, lng: -122.33, matchScore: 71, monthlyTakeHome: 5240, monthlySavings: -180, medianRent: 2150 },
    { name: 'Nashville, TN', lat: 36.16, lng: -86.78, matchScore: 69, monthlyTakeHome: 4520, monthlySavings: 1090, medianRent: 1540 },
    { name: 'Minneapolis, MN', lat: 44.98, lng: -93.27, matchScore: 66, monthlyTakeHome: 4690, monthlySavings: 760, medianRent: 1490 },
    { name: 'Phoenix, AZ', lat: 33.45, lng: -112.07, matchScore: 64, monthlyTakeHome: 4540, monthlySavings: 540, medianRent: 1450 },
    { name: 'Salt Lake City, UT', lat: 40.76, lng: -111.89, matchScore: 63, monthlyTakeHome: 4480, monthlySavings: 700, medianRent: 1520 },
    { name: 'Miami, FL', lat: 25.76, lng: -80.19, matchScore: 58, monthlyTakeHome: 4420, monthlySavings: -240, medianRent: 1980 },
  ],
};

// Maps a hash to the screen to render. Login is intentionally NOT here — it's a
// modal overlay (below), not a full page.
function renderScreen(hash) {
  if (hash.startsWith('#/financials/model')) return <SlideModel />;
  if (hash.startsWith('#/financials/ltv')) return <SlideLtv />;
  if (hash.startsWith('#/financials')) return <FinancialsView />;
  if (hash.startsWith('#/about')) return <About />;
  if (hash.startsWith('#/faq')) return <FAQ />;
  if (hash.startsWith('#/pricing/global')) return <Pricing variant="global" />;
  if (hash.startsWith('#/pricing')) return <Pricing />;
  if (hash.startsWith('#/map')) return <ResultsMap {...MAP_PREVIEW} onSelect={() => {}} onEdit={() => {}} />;
  return <Potential />;
}

// Lightweight hash routing. #/login is special: instead of navigating to a login
// page, it overlays <LoginModal> on top of whatever screen the user was on, and
// closing (× / backdrop / Esc / success) returns there. Every existing
// `#/login` link therefore becomes a dismissable popup with no per-screen edits.
export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const isLogin = hash.startsWith('#/login');

  // Remember the last non-login hash so the modal overlays it and closing returns there.
  const prevHash = useRef(isLogin ? '' : hash);
  useEffect(() => { if (!isLogin) prevHash.current = hash; }, [hash, isLogin]);

  const screenHash = isLogin ? prevHash.current : hash;
  const closeLogin = () => {
    window.location.hash = prevHash.current && !prevHash.current.startsWith('#/login') ? prevHash.current : '';
  };

  return (
    <>
      {renderScreen(screenHash)}
      {isLogin && <LoginModal onClose={closeLogin} />}
    </>
  );
}
