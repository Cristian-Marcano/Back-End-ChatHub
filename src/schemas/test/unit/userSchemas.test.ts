import { describe, it, expect } from 'vitest';
import { validateUser, validateUserRefine } from '../../userSchemas';

describe('User Schemas Validation', () => {
  it('should validate a correct registration payload (validateUser)', () => {
    const validData = {
      username: 'johndoe',
      email: 'john@example.com',
      password: 'StrongPassword123!'
    };
    const result = validateUser(validData);
    expect(result.success).toBe(true);
  });

  it('should reject registration if password is too short', () => {
    const invalidData = {
      username: 'johndoe',
      email: 'john@example.com',
      password: '123'
    };
    const result = validateUser(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate a login payload with just email and password (validateUserRefine)', () => {
    const validData = {
      email: 'john@example.com',
      password: 'StrongPassword123!'
    };
    const result = validateUserRefine(validData);
    expect(result.success).toBe(true);
  });

  it('should reject login payload if both email and username are missing', () => {
    const invalidData = {
      password: 'StrongPassword123!'
    };
    const result = validateUserRefine(invalidData);
    expect(result.success).toBe(false);
  });
});
