import { describe, it, expect, vi } from 'vitest';
import { assignToken, generateRandomToken } from './token';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked-token-123'),
  },
}));

describe('Token Utility', () => {
  it('should assign a JWT token correctly', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const token = assignToken({ id: userId });
    
    expect(jwt.sign).toHaveBeenCalled();
    expect(token).toBe('mocked-token-123');
  });

  it('should generate a 80-character random hex token', () => {
    const token = generateRandomToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(80); // 40 bytes hex is 80 characters
  });
});
