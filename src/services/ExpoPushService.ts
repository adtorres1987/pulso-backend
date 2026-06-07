interface PushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
}

interface PushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function sendPushNotifications(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  // Expo accepts batches of up to 100 messages
  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        console.error('[push] Expo API error:', response.status, await response.text());
        continue;
      }

      const result = (await response.json()) as { data: PushTicket[] };
      for (const ticket of result.data) {
        if (ticket.status === 'error') {
          console.error('[push] Ticket error:', ticket.message, ticket.details);
        }
      }
    } catch (err) {
      console.error('[push] Network error sending notifications:', err);
    }
  }
}

export function buildMessage(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
): PushMessage[] {
  return tokens
    .filter((t) => t.startsWith('ExponentPushToken['))
    .map((to) => ({ to, title, body, sound: 'default' as const, data }));
}
