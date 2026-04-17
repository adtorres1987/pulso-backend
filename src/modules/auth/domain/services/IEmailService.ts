export interface IEmailService {
  sendPasswordReset(to: string, resetLink: string): Promise<void>;
}
