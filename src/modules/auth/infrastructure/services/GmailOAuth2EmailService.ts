import nodemailer from 'nodemailer';
import { env } from '../../../../config/env';
import { IEmailService } from '../../domain/services/IEmailService';

export class GmailOAuth2EmailService implements IEmailService {
  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: env.GMAIL_USER,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      refreshToken: env.GOOGLE_REFRESH_TOKEN,
    },
  });

  async sendPasswordReset(to: string, resetLink: string, expiryHours = 1): Promise<void> {
    const expiryLabel = expiryHours === 1 ? '1 hora / 1 hour' : `${expiryHours} horas / ${expiryHours} hours`;

    await this.transporter.sendMail({
      from: `Pulso App <${env.GMAIL_USER}>`,
      to,
      subject: 'Recupera tu contraseña / Reset your password',
      text: [
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
      ].join('\n'),
    });
  }
}
