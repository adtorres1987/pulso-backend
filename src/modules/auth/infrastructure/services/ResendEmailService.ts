import { Resend } from 'resend';
import { env } from '../../../../config/env';
import { IEmailService } from '../../domain/services/IEmailService';

export class ResendEmailService implements IEmailService {
  private readonly client = new Resend(env.RESEND_API_KEY);

  async sendPasswordReset(to: string, resetLink: string, expiryHours = 1): Promise<void> {
    const expiryLabel = expiryHours === 1 ? '1 hora / 1 hour' : `${expiryHours} horas / ${expiryHours} hours`;

    await this.client.emails.send({
      from: env.EMAIL_FROM,
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
