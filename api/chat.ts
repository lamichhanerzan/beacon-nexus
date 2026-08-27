import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runChat, type ChatRequestBody } from './_lib/chatCore.js';

/**
 * Serverless function: POST /api/chat
 * Proxies the BEACON Assistant's free-text questions to Claude.
 * The API key lives only in the server environment (ANTHROPIC_API_KEY) —
 * it is never sent to or read from the client.
 * Vercel's Node runtime auto-parses a JSON request body into req.body.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const result = await runChat(req.body as ChatRequestBody | undefined);
  res.status(result.status).json(result.body);
}
