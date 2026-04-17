import nodemailer from 'nodemailer';
import { env } from '../../../../config/env';
import { IEmailService } from '../../domain/services/IEmailService';

export class NodemailerEmailService implements IEmailService {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  async sendPasswordReset(to: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'Recupera tu contraseña / Reset your password',
      text: [
        'Recibimos una solicitud para restablecer tu contraseña.',
        '',
        'Haz clic en el siguiente enlace para continuar (válido por 1 hora):',
        resetLink,
        '',
        '---',
        'We received a request to reset your password.',
        'Click the link below to continue (valid for 1 hour):',
        resetLink,
        '',
        'Si no solicitaste esto, ignora este mensaje.',
        'If you did not request this, please ignore this email.',
      ].join('\n'),
    });
  }
}
