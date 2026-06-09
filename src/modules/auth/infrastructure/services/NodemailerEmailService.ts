import nodemailer from 'nodemailer';
import { env } from '../../../../config/env';
import { IEmailService } from '../../domain/services/IEmailService';

export class NodemailerEmailService implements IEmailService {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    family: 4, // force IPv4 — prevents ENETUNREACH on hosts without IPv6 routing
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  } as nodemailer.TransportOptions & { family?: number });

  async sendPasswordReset(to: string, resetLink: string, expiryHours = 1): Promise<void> {
    const expiryLabel = expiryHours === 1 ? '1 hora / 1 hour' : `${expiryHours} horas / ${expiryHours} hours`;
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
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
