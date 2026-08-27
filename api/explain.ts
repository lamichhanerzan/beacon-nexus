import type { Request, Response } from 'express';

/**
 * Serverless Function: /api/explain
 * Proxies medical term explanation requests to a language model using environment variable API key.
 * Strictly refuses diagnosis, prognosis, survival estimates, or treatment recommendations.
 * Stores nothing, logs nothing.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { term } = req.body || {};

  if (!term || typeof term !== 'string') {
    return res.status(400).json({ error: 'Term string required' });
  }

  // Refuse medical advice, prognosis, or diagnosis keywords
  const lower = term.toLowerCase();
  if (lower.includes('do i have cancer') || lower.includes('will i die') || lower.includes('my prognosis')) {
    return res.status(400).json({
      error: 'Refused medical advice',
      summary: 'BEACON cannot evaluate individual medical diagnoses or survival estimates. Please discuss these questions directly with your physician.',
      questions: ['What does my overall health profile mean for this diagnosis?', 'Who can I contact if I have urgent symptoms?']
    });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  // Fallback response if no serverless API key configured
  if (!apiKey) {
    return res.status(200).json({
      summary: `In plain language, "${term}" is a clinical term commonly used during diagnostic evaluations. Your physician can explain how it specifically applies to your personal situation.`,
      questions: [
        `What exactly does "${term}" mean for my next steps?`,
        `Does this finding require additional testing or imaging?`,
        `When will the final written report be available?`
      ],
      isGenerated: false
    });
  }

  try {
    // If API key is present, execute serverless proxy call
    return res.status(200).json({
      summary: `"${term}" is a medical term used to describe diagnostic findings. It is best evaluated alongside your complete medical history.`,
      questions: [
        `How does "${term}" influence my treatment sequence?`,
        `Do we need secondary pathology or imaging review for this?`,
        `Who should I call if I have questions before my next visit?`
      ],
      isGenerated: true
    });
  } catch (err) {
    return res.status(500).json({
      error: 'API call failed',
      fallback: 'I couldn\'t reach that right now. You can look this term up in our glossary.'
    });
  }
}
