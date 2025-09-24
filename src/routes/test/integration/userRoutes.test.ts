
vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn().mockReturnValue({
      getConnection: vi.fn().mockResolvedValue({ release: vi.fn() }),
      releaseConnection: vi.fn(),
      execute: vi.fn(),
    }),
  },
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { json } from 'express';
import { createUserRouter } from '../../../routes/userRoutes';

// We must mock validateAuthorization so it lets requests through
vi.mock('../../../utils/token', () => ({
  validateAuthorization: (req: any, res: any, next: any) => {
    // If no auth header, fail (simulating real middleware)
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Token not provided' });
    }
    // Simulate user payload attached to socket/req
    req.body = req.body || {}; req.body.userPayload = { id: 'user123' };
    next();
  }
}));


vi.mock('../../../db/mysql/transaction', () => ({
  withTransaction: vi.fn(async (cb) => await cb({})),
}));

describe('User Integration Tests', () => {
  let app: express.Express;
  let mockModels: any;

  beforeEach(() => {
    mockModels = {
      userInfoModel: {
        getUserInfoById: vi.fn(),
      },
      userModel: {
        updateUser: vi.fn(),
      },
    };

    app = express();
    app.use(json());
    app.use('/api/users', createUserRouter(mockModels));
  });

  describe('GET /api/users/info', () => {
    it('should return 401 if no authorization header is provided', async () => {
      const response = await request(app)
        .get('/api/users/info');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token not provided');
    });

    it('should return 200 and user info when token is provided', async () => {
      mockModels.userInfoModel.getUserInfoById.mockResolvedValue([
        { about: 'Hello world', created_at: '2025-01-01' }
      ]);

      const response = await request(app)
        .get('/api/users/info')
        .set('Authorization', 'Bearer some-valid-token');

      expect(response.status).toBe(200);
      expect(response.body.about).toBe('Hello world');
    });
  });
});
