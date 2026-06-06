import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OnboardingUserDto } from './onboarding-user.dto';

describe('OnboardingUserDto', () => {
  it('should accept a strong password within 72 characters', async () => {
    const dto = plainToInstance(OnboardingUserDto, {
      name: 'Admin',
      email: 'admin@teste.com',
      password: 'SenhaForte@2026',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject password longer than 72 characters', async () => {
    const dto = plainToInstance(OnboardingUserDto, {
      name: 'Admin',
      email: 'admin@teste.com',
      password: `Aa1!${'x'.repeat(72)}`,
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('should reject password without special character', async () => {
    const dto = plainToInstance(OnboardingUserDto, {
      name: 'Admin',
      email: 'admin@teste.com',
      password: 'SenhaForte123',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
