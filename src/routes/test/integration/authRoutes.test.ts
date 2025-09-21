import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { json } from 'express';
import { createAuthRouter } from '../../../routes/authRoutes';

describe('Auth Integration Tests', () => {
  let app: express.Express;
  let mockModels: any;

  beforeEach(() => {
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
  });
});
