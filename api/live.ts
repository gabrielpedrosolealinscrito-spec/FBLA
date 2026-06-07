// api/live.ts
// Vercel serverless proxy handler for live AI data.
// Calls Anthropic with web_search_20250305 and returns typed LiveDataResponse.
// On ANY failure (Anthropic, parse, validation) returns golden-path cache with fromCache:true (LIVE-04).
// ANTHROPIC_API_KEY is read only via new Anthropic() from process.env — never hardcoded, never sent to client.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { LiveDataRequest, LiveDataResponse } from '../shared/types';
import Anthropic from '@anthropic-ai/sdk';
import goldenPath from '../data/golden-path/demo-results.json';
import { validateItems, buildPrompt, extractJSON, sanitizeInput } from './live-core';

// ── Country derivation from cityName suffix (LIVE-02/FOUND-03 requirement) ──
// cityName is the full "City, ST"/"City, Country" string (e.g. "London, UK").
// web_search user_location.country wants ISO 3166 alpha-2.
// US cities end in a 2-letter state code (e.g. "TX") which is not in this map → default 'US'.
// NOTE: UK maps to 'GB' (ISO alpha-2 for United Kingdom), not 'UK'.
const COUNTRY_BY_SUFFIX: Record<string, string> = {
  Portugal: 'PT',
  UK: 'GB',
  Germany: 'DE',
  Canada: 'CA',
};

function countryFor(cityName: string): string {
  const suffix = cityName.split(', ').pop() ?? '';
  return COUNTRY_BY_SUFFIX[suffix] ?? 'US';
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Reject non-POST before any processing
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // V5 input validation — runs OUTSIDE try/catch so unknown category → 400 (not 200 with cache)
  let sanitized: LiveDataRequest;
  try {
    sanitized = sanitizeInput({ body: req.body as LiveDataRequest });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid request' });
    return;
  }

  const { category, cityName, profession, age } = sanitized;

  // Helper to build and send the fallback (LIVE-04: never 5xx, never raw error string)
  const serveFallback = () => {
    const gpRecord = goldenPath as Record<string, Record<string, unknown>>;
    const fallbackItems = gpRecord[category]?.[cityName] ?? [];
    const response: LiveDataResponse = { category, cityName, fromCache: true, items: fallbackItems };
    res.status(200).json(response);
  };

  try {
    // Construct Anthropic client inside try so a missing key falls back to cache (LIVE-04).
    // maxRetries: 0 — on stage the hotspot is killed while `vercel dev` is still up, so the
    // SDK hits a connection error. The default (2 retries with backoff) would stall the catch
    // for seconds, breaking SC4's "instant, no spinner" offline render. With no retries the
    // failure propagates immediately → serveFallback fires fast. A successful live call never
    // retries, so the legitimate 8-20s web_search path is unaffected.
    const client = new Anthropic({ maxRetries: 0 }); // reads ANTHROPIC_API_KEY from process.env

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048, // 1024 truncates JSON → parse failure → always cache (defeats D-04)
      system:
        'You are a data assistant. After searching the web, output ONLY a JSON block. ' +
        'No prose, no explanations outside the JSON block. ' +
        'Format: ```json\n[...]\n```',
      messages: [
        {
          role: 'user',
          content: buildPrompt(category, cityName, profession, age),
        },
      ],
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3,
          user_location: {
            type: 'approximate',
            city: cityName,
            country: countryFor(cityName),
          },
        } as unknown as Anthropic.Tool,
      ],
    });

    // Extract text blocks from content-block array response
    const text = msg.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as Anthropic.TextBlock).text)
      .join('');

    const raw = extractJSON(text);       // throws on malformed → catch → fallback
    const items = validateItems(category, raw); // throws on bad shape → catch → fallback

    const response: LiveDataResponse = { category, cityName, fromCache: false, items };
    res.status(200).json(response);
  } catch {
    // SC5: Anthropic failed, parse failed, or validation failed — serve golden-path with fromCache:true.
    // Never serialize error details, stack traces, or process.env values to the client.
    serveFallback();
  }
}
