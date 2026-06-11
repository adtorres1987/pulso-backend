import Anthropic, { APIError } from '@anthropic-ai/sdk';
import { AppError } from '../../../../middlewares/errorHandler';

export interface ScanReceiptResult {
  amount: number | null;
  date: string | null;
  description: string | null;
}

const PROMPT = `Extract from this receipt or invoice: the total amount paid, the date, and the merchant or establishment name.
Return ONLY a valid JSON object with no extra text or markdown:
{"amount": <number or null>, "date": "<YYYY-MM-DD or null>", "description": "<merchant name or null>"}
Use null for any field you cannot determine with confidence.`;

export class ScanGroupExpenseReceiptUseCase {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async execute(buffer: Buffer, mimeType: string): Promise<ScanReceiptResult> {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
    type ValidMime = typeof validTypes[number];
    const mediaType: ValidMime = (validTypes as readonly string[]).includes(mimeType)
      ? (mimeType as ValidMime)
      : 'image/jpeg';

    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: buffer.toString('base64') },
            },
            { type: 'text', text: PROMPT },
          ],
        }],
      });
    } catch (err) {
      if (err instanceof APIError) {
        // Surface billing / auth errors clearly instead of a generic 500
        throw new AppError(err.message, err.status ?? 502);
      }
      throw err;
    }

    const raw = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '{}';
    // Strip markdown code fences the model sometimes adds despite instructions
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed: { amount?: unknown; date?: unknown; description?: unknown };
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
      // Last resort: extract the first {...} block from the response
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]) as typeof parsed;
        } catch {
          throw new AppError('Could not parse receipt data from image', 422);
        }
      } else {
        throw new AppError('Could not parse receipt data from image', 422);
      }
    }

    const amount = typeof parsed.amount === 'number' && parsed.amount > 0 ? parsed.amount : null;
    const date =
      typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
        ? parsed.date
        : null;
    const description =
      typeof parsed.description === 'string' && parsed.description.trim()
        ? parsed.description.trim()
        : null;

    return { amount, date, description };
  }
}
