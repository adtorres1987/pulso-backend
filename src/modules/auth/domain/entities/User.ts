export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly language: string,
    public readonly timezone: string,
    public readonly onboardingCompleted: boolean,
    public readonly createdAt: Date,
  ) {}
}
