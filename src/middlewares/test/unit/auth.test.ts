import { describe, it, expect, vi } from 'vitest';
import { authMiddleware } from '../../auth';
import * as tokenUtils from '../../../utils/token';

vi.mock('../../../utils/token', () => ({
  validateToken: vi.fn(),
}));

describe('Auth Middleware', () => {
  it('should call next with error if no token is provided', () => {
    const mockSocket = { handshake: { headers: {}, auth: {} } } as any;
    const mockNext = vi.fn();

    authMiddleware(mockSocket, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new Error('No token provided'));
  });

  it('should call next with error if token is invalid', () => {
    const mockSocket = { handshake: { auth: { token: 'invalid-token' }, headers: {} } } as any;
    const mockNext = vi.fn();

    vi.mocked(tokenUtils.validateToken).mockImplementation(() => {
      throw new Error('Token verification failed');
    });

    authMiddleware(mockSocket, mockNext);

    expect(mockNext).toHaveBeenCalledWith(new Error('Invalid token'));
  });

  it('should assign decoded token to socket.data and call next if token is valid', () => {
    const mockSocket = { handshake: { auth: { token: 'valid-token' }, headers: {} }, data: {} } as any;
    const mockNext = vi.fn();

    vi.mocked(tokenUtils.validateToken).mockReturnValue({ id: '123' } as any);

    authMiddleware(mockSocket, mockNext);

    expect(mockSocket.data).toEqual({ id: '123' });
    expect(mockNext).toHaveBeenCalledWith(); // Called without arguments (success)
  });
});
