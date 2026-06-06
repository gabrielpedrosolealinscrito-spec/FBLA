// scripts/capture-golden-path.ts
// Run: npx tsx scripts/capture-golden-path.ts
//
// Pre-requisites:
//   1. ANTHROPIC_API_KEY set in .env (the running vercel dev proxy holds the key)
//   2. web_search enabled in Anthropic Console (org admin setting — see Pitfall 6)
//   3. npm run dev:full (vercel dev) running on localhost:3000 in another terminal
//
// Reads persona + cities from data/golden-path/demo-profile.json.
// Re-pinning the demo persona is a data edit (not a code edit).
//
// CRITICAL GUARD: if any response has fromCache:true, the script throws and does NOT
// write the file (means the proxy fell back — key missing or web_search disabled).
// Only when ALL responses are fromCache:false is demo-results.json overwritten.

import * as fs from 'fs';
import * as path from 'path';

interface DemoProfile {
  profession: string;
  age: number;
  housing: string;
  cities: string[];
}

interface CaptureResponse {
  items: unknown;
  fromCache: boolean;
  category: string;
  cityName: string;
}

async function main(): Promise<void> {
  // Read persona + cities from demo-profile.json (no hardcoded city list)
  const profilePath = path.resolve(__dirname, '../data/golden-path/demo-profile.json');
  const profile: DemoProfile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

  const { profession, age, housing, cities } = profile;

  // Derive the housing category from persona preference
  const housingCategory = housing === 'rent' ? 'housing_rent' : 'housing_buy';
  const categories = ['jobs', housingCategory, 'dayinlife'] as const;

  console.log(`Capturing golden-path for persona: ${profession}, age ${age}, housing=${housing}`);
  console.log(`Cities: ${cities.join(', ')}`);
  console.log(`Categories: ${categories.join(', ')}`);
  console.log('');

  // Collect all results; key by full city.name string (byte-identical to golden-path keys)
  const result: Record<string, Record<string, unknown>> = {};
  for (const cat of categories) {
    result[cat] = {};
  }

  let requestCount = 0;
  for (const cat of categories) {
    for (const cityName of cities) {
      requestCount++;
      console.log(`[${requestCount}/${categories.length * cities.length}] ${cat} / ${cityName} ...`);

      const res = await fetch('http://localhost:3000/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, cityName, profession, age }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${cat} / ${cityName} — is vercel dev running on localhost:3000?`);
      }

      const data = (await res.json()) as CaptureResponse;

      if (data.fromCache === true) {
        throw new Error(
          `Got fromCache:true for ${cat} / ${cityName} — proxy fell back to cache.\n` +
          `Check that ANTHROPIC_API_KEY is set in .env and web_search is enabled in the Anthropic Console.\n` +
          `(Pitfall 6: web_search silently no-ops if disabled; usage.server_tool_use.web_search_requests must be > 0)`
        );
      }

      // Key the output by the FULL city.name string — byte-identical to the existing stub keys
      result[cat][cityName] = data.items;
      console.log(`  OK (fromCache:false)`);
    }
  }

  // All requests succeeded with fromCache:false — safe to overwrite
  const outputPath = path.resolve(__dirname, '../data/golden-path/demo-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');

  console.log('');
  console.log(`Wrote ${outputPath}`);
  console.log(`Categories captured: ${Object.keys(result).join(', ')}`);
  console.log(`Cities captured: ${cities.join(', ')}`);
  console.log('Done.');
}

main().catch((err: Error) => {
  console.error('Capture failed:', err.message);
  process.exit(1);
});
