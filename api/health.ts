import type { Tier } from '../shared/types';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  // Proves shared/types.ts Tier is importable from api/ TypeScript.
  // This value is type-annotated but not sent to the client.
  const tier: Tier = 'free';
  void tier; // suppress unused-variable warning

  res.status(200).json({ ok: true, phase: 1 });
}
