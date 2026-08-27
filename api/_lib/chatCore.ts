import Anthropic from '@anthropic-ai/sdk';

/**
 * Shared core for POST /api/chat, framework-agnostic (no req/res coupling)
 * so it can run under both the Vercel Node runtime (api/chat.ts) and the
 * local Vite dev server (vite.config.ts) without duplicating the logic.
 * The API key lives only in the server environment (ANTHROPIC_API_KEY) —
 * it is never sent to or read from the client.
 */

const MODEL = 'claude-sonnet-5';

const SYSTEM_PROMPT = `You are the BEACON Assistant, embedded in a patient-facing cancer navigation app.

Hard rules:
- Never predict clinical outcomes: no survival estimates, prognosis, recurrence risk, or "what will happen with my cancer."
- Never diagnose or tell a user what condition they have.
- If asked any of the above, say you cannot evaluate that and to ask their care team, then offer to help with something else.
- Do not ask the user for their name, date of birth, exact address, phone number, or medical record numbers.
- Keep answers concise, plain-language, and factual. This is not a medical-advice chatbot — it explains terms, logistics, and general information.
- When you use web search, prefer recent, reputable sources (hospitals, ACS, NCI, CMS, patient-advocacy nonprofits) and say so briefly.`;

export interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  webSearch?: boolean;
}

export interface ChatResult {
  status: number;
  body: Record<string, unknown>;
}

export async function runChat(body: ChatRequestBody | undefined): Promise<ChatResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { status: 500, body: { error: 'ANTHROPIC_API_KEY is not configured on the server.' } };
  }

  const { messages, webSearch } = body || ({} as ChatRequestBody);
  if (!Array.isArray(messages) || messages.length === 0) {
    return { status: 400, body: { error: 'messages array is required' } };
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
      ...(webSearch
        ? { tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 3 } as Anthropic.WebSearchTool20260209] }
        : {}),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    const usedWebSearch = response.content.some((block) => block.type === 'web_search_tool_result');

    return { status: 200, body: { text, usedWebSearch, stopReason: response.stop_reason } };
  } catch (err: unknown) {
    const status = err instanceof Anthropic.APIError ? err.status : undefined;
    console.error('Anthropic API error', status, err instanceof Error ? err.message : err);
    return { status: 502, body: { error: 'Could not reach Claude right now. Please try again.' } };
  }
}
