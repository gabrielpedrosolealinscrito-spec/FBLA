import React from 'react';
import ReactDOM from 'react-dom/client';
import ResultsMapNight from './screens/ResultsMapNight.jsx';

// ═══════════════════════════════════════════════════════════════
// NIGHT MAP PREVIEW — dev-only. Renders the night/gold ResultsMap
// straight away with mock engine-shaped rows, so the map UI can be
// iterated without going through landing → quiz. Not part of the
// production bundle (index.html → main.jsx).
// ═══════════════════════════════════════════════════════════════

// rows shaped exactly like matchEngine.scoreProfile() output
const MOCK = [
  { name: "Austin, TX",        lat: 30.27, lng: -97.74,  matchScore: 88, monthlyTakeHome: 5180, monthlySavings:  980, medianRent: 1650 },
  { name: "Raleigh, NC",       lat: 35.78, lng: -78.64,  matchScore: 81, monthlyTakeHome: 4760, monthlySavings: 1180, medianRent: 1420 },
  { name: "Denver, CO",        lat: 39.74, lng: -104.99, matchScore: 79, monthlyTakeHome: 4980, monthlySavings:  640, medianRent: 1780 },
  { name: "Chicago, IL",       lat: 41.88, lng: -87.63,  matchScore: 74, monthlyTakeHome: 4860, monthlySavings:  420, medianRent: 1740 },
  { name: "Portland, OR",      lat: 45.52, lng: -122.68, matchScore: 72, monthlyTakeHome: 4710, monthlySavings:  310, medianRent: 1620 },
  { name: "Seattle, WA",       lat: 47.61, lng: -122.33, matchScore: 70, monthlyTakeHome: 5240, monthlySavings: -180, medianRent: 2150 },
  { name: "Nashville, TN",     lat: 36.16, lng: -86.78,  matchScore: 69, monthlyTakeHome: 4520, monthlySavings: 1090, medianRent: 1540 },
  { name: "Kansas City, MO",   lat: 39.10, lng: -94.58,  matchScore: 67, monthlyTakeHome: 4380, monthlySavings: 1240, medianRent: 1180 },
  { name: "Minneapolis, MN",   lat: 44.98, lng: -93.27,  matchScore: 66, monthlyTakeHome: 4690, monthlySavings:  760, medianRent: 1490 },
  { name: "Phoenix, AZ",       lat: 33.45, lng: -112.07, matchScore: 64, monthlyTakeHome: 4540, monthlySavings:  540, medianRent: 1450 },
  { name: "Salt Lake City, UT",lat: 40.76, lng: -111.89, matchScore: 63, monthlyTakeHome: 4480, monthlySavings:  700, medianRent: 1520 },
  { name: "Miami, FL",         lat: 25.76, lng: -80.19,  matchScore: 58, monthlyTakeHome: 4420, monthlySavings: -240, medianRent: 1980 },
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ResultsMapNight
      results={MOCK}
      profile={{ profession: 'Physical therapist', hasRemote: true }}
      onSelect={(row) => console.info('onSelect →', row.name)}
      onEdit={() => console.info('onEdit')}
    />
  </React.StrictMode>
);
