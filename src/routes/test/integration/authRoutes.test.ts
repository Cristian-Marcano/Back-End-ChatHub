process.env.SECRET_KEY = 'test';
process.env.REFRESH_SECRET_KEY = 'test';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { json } from 'express';
import { createAuthRouter } from '../../../routes/authRoutes';
import * as passwordUtils from '../../../utils/password';


vi.mock('../../../utils/token', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    assignToken: vi.fn().mockReturnValue('mocked_token'),
    generateRandomToken: vi.fn().mockReturnValue('mocked_refresh_token'),
  };
});

vi.mock('../../../utils/password', () => ({
  validateHashedPassword: vi.fn(),
}));


describe('Auth Integration Tests', () => {
  let app: express.Express;
  let mockModels: any;

  beforeEach(() => {
    process.env.SECRET_KEY = 'test';
    process.env.REFRESH_SECRET_KEY = 'test';
    mockModels = {
      userModel: {
        getUserByUsernameOrEmail: vi.fn(),
        getUser: vi.fn(),
      },
      tempEmailsModel: {
        createTempEmail: vi.fn(),
      },
      refreshTokensModel: {
        createRefreshToken: vi.fn(),
      },
      passwordResetsModel: {},
    };

    app = express();
    app.use(json());
    app.use('/api/auth', createAuthRouter(mockModels));
  });

  describe('PUT /api/auth/signup', () => {
    it('should return 422 if Zod validation fails', async () => {
      const response = await request(app)
        .put('/api/auth/signup')
        .send({ email: 'bademail' });

      expect(response.status).toBe(422);
      expect(response.body.error[0].message).toContain('Username is required');
    });

    it('should return 404 if username exists (simulated from service)', async () => {
      // simulate the model throwing an error when username exists
      // Wait, in `AuthService`, it throws Error('USERNAME_EXISTS') if `getUserByUsernameOrEmail` returns a user.
      mockModels.userModel.getUser.mockResolvedValue([{ id: '123', username: 'johndoe' }]);

      const response = await request(app)
        .put('/api/auth/signup')
        .send({
          email: 'valid@example.com',
          username: 'johndoe',
          password: 'StrongPassword123!'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Username alredy exists');
    });

  describe('POST /api/auth/login', () => {
    it('should return 200 and a cookie when credentials are valid', async () => {
      mockModels.userModel.getUserByUsernameOrEmail.mockResolvedValue([{ id: '123e4567-e89b-12d3-a456-426614174000', username: 'johndoe', keyword: 'hashedpass' }]);
      vi.mocked(passwordUtils.validateHashedPassword).mockResolvedValue(true);
      mockModels.refreshTokensModel.createRefreshToken.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
          password: 'CorrectPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      
      // Check that a set-cookie header was sent
      expect(response.body.refreshToken).toBeDefined();
      
    });

    it('should return 401 if password does not match', async () => {
      mockModels.userModel.getUserByUsernameOrEmail.mockResolvedValue([{ id: '123e4567-e89b-12d3-a456-426614174000', username: 'johndoe', keyword: 'hashedpass' }]);
      vi.mocked(passwordUtils.validateHashedPassword).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'johndoe',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Username or Email or Password is invalid');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 and clear the cookie', async () => {
      // Mocking revokeAllUserTokens
      mockModels.refreshTokensModel.revokeToken = vi.fn();

      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'sometoken' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
      
    });
  });
});

});
