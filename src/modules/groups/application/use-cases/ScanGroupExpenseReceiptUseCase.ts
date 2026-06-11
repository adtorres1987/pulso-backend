import Anthropic, { APIError } from '@anthropic-ai/sdk';
import type { ContentBlockParam, DocumentBlockParam, ImageBlockParam } from '@anthropic-ai/sdk/resources/messages/messages';
import { AppError } from '../../../../middlewares/errorHandler';

export interface ScanReceiptResult {
  amount: number | null;
  date: string | null;
  description: string | null;
}

const PROMPT = `Extract from this receipt, invoice or PDF document: the total amount paid, the date, and the merchant or establishment name.
Return ONLY a valid JSON object with no extra text or markdown:
{"amount": <number or null>, "date": "<YYYY-MM-DD or null>", "description": "<merchant name or null>"}
Use null for any field you cannot determine with confidence.`;

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type ValidImageMime = typeof VALID_IMAGE_TYPES[number];

export class ScanGroupExpenseReceiptUseCase {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  async execute(buffer: Buffer, mimeType: string): Promise<ScanReceiptResult> {
    const data = buffer.toString('base64');

    const fileBlock: ContentBlockParam = mimeType === 'application/pdf'
      ? ({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data },
        } satisfies DocumentBlockParam)
      : ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: (VALID_IMAGE_TYPES as readonly string[]).includes(mimeType)
              ? (mimeType as ValidImageMime)
              : 'image/jpeg',
            data,
          },
        } satisfies ImageBlockParam);

    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: [fileBlock, { type: 'text', text: PROMPT }],
        }],
      });
    } catch (err) {
      if (err instanceof APIError) {
        throw new AppError(err.message, err.status ?? 502);
      }
      throw err;
    }

    const raw = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '{}';
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed: { amount?: unknown; date?: unknown; description?: unknown };
    try {
      parsed = JSON.parse(text) as typeof parsed;
    } catch {
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
