vi.mock('web-push', () => ({ default: { setVapidDetails: vi.fn(), sendNotification: vi.fn() } }));
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { socketEventHandler } from '../../index';

vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn().mockReturnValue({
      getConnection: vi.fn().mockResolvedValue({ release: vi.fn() }),
      releaseConnection: vi.fn(),
      execute: vi.fn(),
    }),
  },
}));

vi.mock('../../../db/mysql/transaction', () => ({
  withTransaction: vi.fn(async (cb) => await cb({})),
}));

describe('Socket Integration Tests', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: ClientSocket;
  let mockModels: any;

  beforeAll(async () => {
    mockModels = {
      userModel: { getUser: vi.fn(), updateUser: vi.fn() },
      userInfoModel: { getUserInfoById: vi.fn() },
      chatModel: { createChat: vi.fn() },
      messageModel: {},
      friendshipModel: {
        createFriendship: vi.fn(),
        getFriendshipById: vi.fn(),
      },
      friendshipChatModel: { createFriendshipChat: vi.fn() },
      groupModel: { createGroup: vi.fn(), addMember: vi.fn() },
      pushSubscriptionsModel: { getSubscriptions: vi.fn(), addSubscription: vi.fn() },
    };

    const httpServer = createServer();
    io = new Server(httpServer);

    io.use((socket, next) => {
      socket.data = { id: '123e4567-e89b-12d3-a456-426614174000' };
      next();
    });

    return new Promise((resolve) => {
      httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        clientSocket = Client(`http://localhost:${port}`);

        io.on('connection', (socket) => {
          serverSocket = socket;
          socketEventHandler(io, socket, mockModels);
        });

        clientSocket.on('connect', resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  describe('friendship:sent', () => {
    it('should validate and call service for friendship creation', () => new Promise<void>((resolve, reject) => {
      mockModels.friendshipModel.createFriendship.mockResolvedValue(10);
      mockModels.userInfoModel.getUserInfoById.mockResolvedValue([{
        first_name: 'John',
        last_name: 'Doe'
      }]);

      clientSocket.on('error:validate', (err) => {
        reject(new Error('Validation error: ' + JSON.stringify(err)));
      });

      clientSocket.emit('friendship:sent', { secondary_user_id: '123e4567-e89b-12d3-a456-426614174001', action_user_id: '123e4567-e89b-12d3-a456-426614174000', status: 'pending' });
      
      setTimeout(() => {
        try {
          expect(mockModels.friendshipModel.createFriendship).toHaveBeenCalled();
          resolve();
        } catch(e) {
          reject(e);
        }
      }, 50);
    }));
  });

  describe('group:createGroupChat', () => {
    it('should validate and create a group chat', () => new Promise<void>((resolve, reject) => {
      mockModels.chatModel.createChat.mockResolvedValue(55);
      mockModels.groupModel.createGroup.mockResolvedValue('55');

      clientSocket.on('error:validate', (err) => {
        reject(new Error('Validation error: ' + JSON.stringify(err)));
      });

      clientSocket.emit('group:create', {
        nickname: 'My Cool Group',
        creator_id: '123e4567-e89b-12d3-a456-426614174000',
        members: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002']
      });

      setTimeout(() => {
        try {
                    expect(mockModels.groupModel.createGroup).toHaveBeenCalled();
          resolve();
        } catch(e) {
          reject(e);
        }
      }, 50);
    }));
  });
});
