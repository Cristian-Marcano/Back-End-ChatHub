import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { AuthService } from './authService';
import { IUserModel } from '../interface/userModel';
import { ITempEmailsModel } from '../interface/tempEmailsModel';
import { IRefreshTokensModel } from '../interface/refreshTokensModel';
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
  let mockUserModel: Mocked<IUserModel>;
  let mockTempEmailsModel: Mocked<ITempEmailsModel>;
  let mockPasswordResetsModel: any;
  let mockRefreshTokensModel: Mocked<IRefreshTokensModel>;
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserModel = {
      getUser: vi.fn(),
      getAllUsers: vi.fn(),
      getUserById: vi.fn(),
      getUserByUsernameOrEmail: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      updatePassword: vi.fn(),
    } as unknown as Mocked<IUserModel>;

    mockTempEmailsModel = {
      getTempEmail: vi.fn(),
      getTempEmailByEmail: vi.fn(),
      createTempEmail: vi.fn(),
      updateTempEmail: vi.fn(),
      updateTempEmailCod: vi.fn(),
      removeTempEmail: vi.fn(),
    } as unknown as Mocked<ITempEmailsModel>;

    mockRefreshTokensModel = {
      createRefreshToken: vi.fn(),
      getValidToken: vi.fn(),
      revokeToken: vi.fn(),
      revokeAllUserTokens: vi.fn(),
    } as unknown as Mocked<IRefreshTokensModel>;

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
        id: '123e4567-e89b-12d3-a456-426614174000',
        keyword: 'hashed-db-password'
      }] as any);
      vi.mocked(passwordUtils.validateHashedPassword).mockResolvedValue(false);
      
      await expect(
        authService.loginUser({ input: { username: 'wrong-pass', password: 'wrong' } })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should successfully log in and return token and refreshToken', async () => {
      mockUserModel.getUserByUsernameOrEmail.mockResolvedValue([{
        id: '123e4567-e89b-12d3-a456-426614174000',
        keyword: 'hashed-db-password'
      }] as any);
      vi.mocked(passwordUtils.validateHashedPassword).mockResolvedValue(true);
      
      const res = await authService.loginUser({ input: { username: 'johndoe', password: 'correct' } });
      
      expect(res.token).toBe('mock-jwt-token');
      expect(res.refreshToken).toBe('mock-refresh-token');
      expect(mockRefreshTokensModel.createRefreshToken).toHaveBeenCalled();
    });
  });

});
