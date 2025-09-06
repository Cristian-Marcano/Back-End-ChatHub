import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './authController';
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

describe('AuthController', () => {
  let mockAuthService: vi.Mocked<AuthService>;
  let authController: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockAuthService = {
      verifyUserExist: vi.fn(),
      registerTemporalEmail: vi.fn(),
      verifyTemporalEmailAndRegister: vi.fn(),
      loginUser: vi.fn(),
    } as any;

    authController = new AuthController({ authService: mockAuthService });

    mockReq = {
      body: {},
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };
  });

  describe('signUp', () => {
    it('should return 422 if payload is invalid', async () => {
      mockReq.body = { email: 'invalid-email' };

      await authController.signUp(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return 404 if username already exists', async () => {
      mockReq.body = { username: 'johndoe', email: 'john@example.com', password: 'StrongPassword123!' };
      mockAuthService.verifyUserExist.mockRejectedValue(new Error('USERNAME_EXISTS'));

      await authController.signUp(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Username alredy exists' });
    });

    it('should return 201 if successful', async () => {
      mockReq.body = { username: 'johndoe', email: 'john@example.com', password: 'StrongPassword123!' };
      mockAuthService.verifyUserExist.mockResolvedValue();
      mockAuthService.registerTemporalEmail.mockResolvedValue();

      await authController.signUp(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Code sent to email' });
    });
  });
});
