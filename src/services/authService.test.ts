import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './authService';
import * as passwordUtils from '../utils/password';
import * as tokenUtils from '../utils/token';
import * as mailToUtils from '../utils/mailTo';

vi.mock('../utils/password', () => ({
  genereteHashedPassword: vi.fn().mockResolvedValue('hashed-password'),
  validateHashedPassword: vi.fn(),
}));

vi.mock('../utils/token', () => ({
  assignToken: vi.fn().mockReturnValue('mock-jwt-token'),
  generateRandomToken: vi.fn().mockReturnValue('mock-refresh-token'),
}));

vi.mock('../utils/mailTo', () => ({
  mailTo: vi.fn().mockResolvedValue({ info: 'mock-info' }),
}));

describe('AuthService', () => {
  let mockUserModel: any;
  let mockTempEmailsModel: any;
  let mockPasswordResetsModel: any;
  let mockRefreshTokensModel: any;
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserModel = {
      register: vi.fn(),
      getUserByUsernameOrEmail: vi.fn(),
      checkIfExist: vi.fn(),
    };

    mockTempEmailsModel = {
      createTempEmail: vi.fn(),
      validateCode: vi.fn(),
    };

    mockRefreshTokensModel = {
      createRefreshToken: vi.fn(),
    };

    authService = new AuthService({
      userModel: mockUserModel,
      tempEmailsModel: mockTempEmailsModel,
      refreshTokensModel: mockRefreshTokensModel,
    } as any);
  });

  describe('loginUser', () => {
    it('should throw an error if user does not exist', async () => {
      mockUserModel.getUserByUsernameOrEmail.mockResolvedValue([]);
      
      await expect(
        authService.loginUser({ input: { username: 'nonexistent', password: '123' } })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should throw an error if password does not match', async () => {
      mockUserModel.getUserByUsernameOrEmail.mockResolvedValue([{
        id: '123',
        keyword: 'hashed-db-password'
      }]);
      vi.mocked(passwordUtils.validateHashedPassword).mockResolvedValue(false);
      
      await expect(
        authService.loginUser({ input: { username: 'wrong-pass', password: 'wrong' } })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should successfully log in and return token and refreshToken', async () => {
      mockUserModel.getUserByUsernameOrEmail.mockResolvedValue([{
        id: '123',
        keyword: 'hashed-db-password'
      }]);
      vi.mocked(passwordUtils.validateHashedPassword).mockResolvedValue(true);
      
      const res = await authService.loginUser({ input: { username: 'johndoe', password: 'correct' } });
      
      expect(res.token).toBe('mock-jwt-token');
      expect(res.refreshToken).toBe('mock-refresh-token');
      expect(mockRefreshTokensModel.createRefreshToken).toHaveBeenCalled();
    });
  });

});
