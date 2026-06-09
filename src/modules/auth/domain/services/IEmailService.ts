export interface IEmailService {
  sendPasswordReset(to: string, resetLink: string, expiryHours?: number): Promise<void>;
}
