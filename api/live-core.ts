// api/live-core.ts
// Pure module — no network calls, no SDK import, no @vercel/node.
// Exported functions: validateItems, buildPrompt, extractJSON, sanitizeInput
// Used by api/live.ts (proxy handler) and testable in vitest without side effects.

import type { LiveCategory, LiveDataRequest } from '../shared/types';

// ── LiveCategory allowlist ──
const LIVE_CATEGORIES: ReadonlySet<string> = new Set<LiveCategory>([
  'jobs', 'housing_rent', 'housing_buy', 'nightlife', 'outdoors', 'food', 'dayinlife',
]);

// ── Type guards (Pattern 4 from RESEARCH.md) ──

interface JobListing {
  title: string;
  company: string;
  salary?: string;
  desc?: string;
  source: string;
}

interface HousingListing {
  name?: string;
  address?: string;
  neighborhood?: string;
  price: string;
  beds: string;
  sqft?: string;
  feature?: string;
  source: string;
}

function isJobListing(x: unknown): x is JobListing {
  return (
    typeof x === 'object' && x !== null &&
    typeof (x as JobListing).title === 'string' &&
    typeof (x as JobListing).company === 'string' &&
    typeof (x as JobListing).source === 'string'
  );
}

function isHousingListing(x: unknown): x is HousingListing {
  return (
    typeof x === 'object' && x !== null &&
    typeof (x as HousingListing).price === 'string' &&
    typeof (x as HousingListing).beds === 'string' &&
    typeof (x as HousingListing).source === 'string'
  );
}

// ── validateItems ──
// Returns the validated value (array for jobs/housing; string for dayinlife).
// Throws on shape mismatch — caller (api/live.ts) catches → golden-path fallback (LIVE-04).
export function validateItems(category: LiveCategory, raw: unknown): unknown {
  if (category === 'dayinlife') {
    if (typeof raw !== 'string') {
      throw new Error('dayinlife items must be a string, not an array or other type (Pitfall 7)');
    }
    return raw;
  }

  if (!Array.isArray(raw)) {
    throw new Error(`expected array for category "${category}", got ${typeof raw}`);
  }

  if (category === 'jobs') {
    if (!raw.every(isJobListing)) {
      throw new Error('invalid job listing shape: each item must have title, company, source');
    }
    return raw;
  }

  if (category === 'housing_rent' || category === 'housing_buy') {
    if (!raw.every(isHousingListing)) {
      throw new Error('invalid housing listing shape: each item must have price, beds, source');
    }
    return raw;
  }

  throw new Error(`unknown category: ${category}`);
}

// ── extractJSON ──
// Extracts and parses a JSON value from a fenced code block or bare JSON text.
// Throws on malformed input — caller catches → golden-path fallback.
export function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();
  return JSON.parse(raw); // throws on malformed JSON
}

// ── buildPrompt ──
// Returns the per-category user prompt string from RESEARCH.md Prompt Design section.
// Prompts instruct "do not include image or URL fields" and request a source field (D-10).
export function buildPrompt(
  category: LiveCategory,
  cityName: string,
  profession?: string,
  age?: number,
): string {
  switch (category) {
    case 'jobs':
      return (
        `Find 4-6 real current job listings for a ${profession ?? 'professional'} in ${cityName}.\n` +
        `Return a JSON array where each object has:\n` +
        `  title (string), company (string), salary (string or "Not listed"),\n` +
        `  desc (string, ≤40 words), source (string — the site name, e.g. "Indeed").\n` +
        `Do not include any URL field. Do not include any image field.`
      );

    case 'housing_rent':
      return (
        `Find 4-6 real current apartments for rent in ${cityName}.\n` +
        `Return a JSON array where each object has:\n` +
        `  neighborhood (string), price (string, e.g. "$1,800/mo"), beds (string, e.g. "2BR"),\n` +
        `  sqft (string or omit), feature (string, ≤15 words, a notable amenity or quality),\n` +
        `  source (string — the site name, e.g. "Zillow").\n` +
        `Do not include image or URL fields.`
      );

    case 'housing_buy':
      return (
        `Find 4-6 real current homes for sale in ${cityName}.\n` +
        `Return a JSON array where each object has:\n` +
        `  address (string), price (string, e.g. "$420,000"), beds (string, e.g. "3BR"),\n` +
        `  sqft (string or omit), feature (string, ≤15 words),\n` +
        `  source (string — the site name, e.g. "Realtor.com").\n` +
        `Do not include image or URL fields.`
      );

    case 'dayinlife': {
      const professionStr = profession ?? 'professional';
      const ageStr = age != null ? `aged ${age}` : '';
      return (
        `Write a vivid, personal "day in the life" narrative for a ${professionStr}${ageStr ? ' ' + ageStr : ''}\n` +
        `who has just moved to ${cityName}. Cover a typical weekday: morning routine, commute\n` +
        `or remote setup, work setting, lunch, evening activity, and neighborhood feel.\n` +
        `Return ONLY a JSON block with a single string field:\n` +
        `\`\`\`json\n"[narrative text here]"\n\`\`\`\n` +
        `Keep it under 250 words. Make it specific to ${cityName}'s actual character.`
      );
    }

    default:
      return `Find current information about ${category} in ${cityName}. Return a JSON array with source field for each item. Do not include image or URL fields.`;
  }
}

// ── sanitizeInput ──
// V5 input validation (RESEARCH.md Security Domain).
// Validates category against LiveCategory allowlist.
// Constrains cityName/profession to alphanumeric + spaces + common punctuation (including comma+space for "City, ST").
// Throws with a descriptive error on invalid input; caller returns 400.
export function sanitizeInput(req: { body: LiveDataRequest }): LiveDataRequest {
  const body = req.body ?? {};
  const { category, cityName, profession, age } = body as LiveDataRequest;

  // Category must be in the LiveCategory allowlist
  if (!category || !LIVE_CATEGORIES.has(category)) {
    throw new Error(`Invalid category: "${category}". Must be one of: ${[...LIVE_CATEGORIES].join(', ')}`);
  }

  // cityName: required; alphanumeric + spaces + common punctuation incl. comma (for "Austin, TX")
  // max 100 chars
  if (!cityName || typeof cityName !== 'string') {
    throw new Error('cityName is required and must be a string');
  }
  if (cityName.length > 100) {
    throw new Error('cityName must be 100 characters or fewer');
  }
  // Charset: letters, digits, spaces, comma, period, hyphen, apostrophe, parentheses
  if (!/^[a-zA-Z0-9 ,.\-'()]+$/.test(cityName)) {
    throw new Error('cityName contains invalid characters');
  }

  // profession: optional; same constraints if present
  if (profession !== undefined) {
    if (typeof profession !== 'string') {
      throw new Error('profession must be a string');
    }
    if (profession.length > 100) {
      throw new Error('profession must be 100 characters or fewer');
    }
    if (!/^[a-zA-Z0-9 ,.\-'()]+$/.test(profession)) {
      throw new Error('profession contains invalid characters');
    }
  }

  // age: optional; must be a number if present
  if (age !== undefined && (typeof age !== 'number' || !Number.isFinite(age))) {
    throw new Error('age must be a finite number');
  }

  return { category: category as LiveCategory, cityName, profession, age };
}
