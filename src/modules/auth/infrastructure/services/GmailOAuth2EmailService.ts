import { google } from 'googleapis';
import { env } from '../../../../config/env';
import { IEmailService } from '../../domain/services/IEmailService';

export class GmailOAuth2EmailService implements IEmailService {
  private getGmailClient() {
    const auth = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });
    return google.gmail({ version: 'v1', auth });
  }

  private buildRaw(to: string, subject: string, body: string): string {
    const message = [
      `From: Pulso App <${env.GMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].join('\r\n');

    return Buffer.from(message).toString('base64url');
  }

  async sendPasswordReset(to: string, resetLink: string, expiryHours = 1): Promise<void> {
    const expiryLabel =
      expiryHours === 1 ? '1 hora / 1 hour' : `${expiryHours} horas / ${expiryHours} hours`;

    const body = [
      'Recibimos una solicitud para restablecer tu contraseña.',
      '',
      `Haz clic en el siguiente enlace para continuar (válido por ${expiryLabel}):`,
      resetLink,
      '',
      '---',
      'We received a request to reset your password.',
      `Click the link below to continue (valid for ${expiryLabel}):`,
      resetLink,
      '',
      'Si no solicitaste esto, ignora este mensaje.',
      'If you did not request this, please ignore this email.',
    ].join('\n');

    const gmail = this.getGmailClient();
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: this.buildRaw(to, 'Recupera tu contraseña / Reset your password', body),
      },
    });
  }
}
