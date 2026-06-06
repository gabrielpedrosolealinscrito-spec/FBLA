// Wave 0 RED test — locks the /api/live handler contract for Plan 02 (api/live.ts).
// This file imports the handler from api/live.ts which does NOT exist yet.
// These tests are RED (module-not-found) until Plan 02 ships the handler.
// Do NOT attempt to make them green in this plan (05-01).
//
// LIVE-04 contract: when @anthropic-ai/sdk messages.create throws, the handler
// must return fromCache: true with golden-path items, never a 5xx raw error.
// The cityName in the request body and the golden-path lookup key are the SAME
// full string "Austin, TX" — the plan's city-key contract (load-bearing).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import goldenPath from '../data/golden-path/demo-results.json';

// Mock @anthropic-ai/sdk so messages.create always throws.
// This simulates SC5: proxy reachable, Anthropic fails.
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockRejectedValue(new Error('Anthropic API error')),
      },
    })),
  };
});

// Import the handler AFTER the mock is set up (hoisting handled by vi.mock).
// api/live.ts does NOT exist yet — this import causes the suite to be RED.
import handler from '../api/live';

// Minimal mock VercelRequest/VercelResponse for testing the handler in isolation.
function makeReq(body: object): { method: string; body: object } {
  return { method: 'POST', body };
}

function makeRes() {
  const res = {
    _status: 200,
    _body: null as unknown,
    status(code: number) {
      res._status = code;
      return res;
    },
    json(body: unknown) {
      res._body = body;
      return res;
    },
  };
  return res;
}

describe('api/live handler — LIVE-04 fromCache fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fromCache: true with golden-path jobs for Austin, TX when Anthropic throws', async () => {
    const req = makeReq({ category: 'jobs', cityName: 'Austin, TX', profession: 'Software Engineer' });
    const res = makeRes();

    await handler(req as never, res as never);

    expect(res._status).toBe(200);
    const body = res._body as { fromCache: boolean; items: unknown; category: string; cityName: string };
    expect(body.fromCache).toBe(true);
    expect(body.category).toBe('jobs');
    expect(body.cityName).toBe('Austin, TX');
    // Items must equal the golden-path fixture — not a stale literal (advisor guidance).
    // The city-key contract is load-bearing: "Austin, TX" exact string, not "Austin".
    expect(body.items).toEqual(goldenPath.jobs['Austin, TX']);
  });

  it('returns status 200 (not 5xx) even when Anthropic throws (LIVE-04 never-5xx guarantee)', async () => {
    const req = makeReq({ category: 'jobs', cityName: 'Austin, TX' });
    const res = makeRes();

    await handler(req as never, res as never);

    expect(res._status).toBe(200);
  });

  it('returns 405 for non-POST requests', async () => {
    const req = { method: 'GET', body: {} };
    const res = makeRes();

    await handler(req as never, res as never);

    expect(res._status).toBe(405);
  });
});
