import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { FriendshipService } from './friendshipService';
import { IFriendshipModel } from '../interface/friendshipModel';
import { IChatModel } from '../interface/chatModel';
import { IUserInfoModel } from '../interface/userInfoModel';
import { IFriendshipChatModel } from '../interface/friendshipChatModel';

vi.mock('../db/mysql/transaction', () => ({
  withTransaction: vi.fn(async (callback) => {
    return await callback({});
  }),
}));

describe('FriendshipService', () => {
  let mockFriendshipModel: Mocked<IFriendshipModel>;
  let mockChatModel: Mocked<IChatModel>;
  let mockUserInfoModel: Mocked<IUserInfoModel>;
  let mockFriendshipChatModel: Mocked<IFriendshipChatModel>;
  let friendshipService: FriendshipService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFriendshipModel = {
      createFriendship: vi.fn(),
      updateFriendship: vi.fn(),
      getFriendshipById: vi.fn(),
      getFriendshipsByUserId: vi.fn(),
      removeFriendship: vi.fn(),
    } as unknown as Mocked<IFriendshipModel>;

    mockChatModel = {
      createChat: vi.fn(),
      getChats: vi.fn(),
      getChatById: vi.fn(),
      getChatsByName: vi.fn(),
      removeChat: vi.fn(),
      getChatMembers: vi.fn(),
    } as unknown as Mocked<IChatModel>;

    mockUserInfoModel = {
      getUserInfoById: vi.fn(),
      getUsersInfo: vi.fn(),
      createUserInfo: vi.fn(),
      updateUserInfo: vi.fn(),
      upsertUserInfo: vi.fn(),
    } as unknown as Mocked<IUserInfoModel>;

    mockFriendshipChatModel = {
      createFriendshipChat: vi.fn(),
      getFriendshipChats: vi.fn(),
      getFriendshipChatsByName: vi.fn(),
      updateFriendshipChat: vi.fn(),
      removeFriendshipChat: vi.fn(),
      getFriendshipIdByChatId: vi.fn(),
    } as unknown as Mocked<IFriendshipChatModel>;

    friendshipService = new FriendshipService({
      friendshipModel: mockFriendshipModel,
      chatModel: mockChatModel,
      userInfoModel: mockUserInfoModel,
      friendshipChatModel: mockFriendshipChatModel,
    } as any);
  });

  describe('sentFriendship', () => {
    it('should create a friendship via the model', async () => {
      mockFriendshipModel.createFriendship.mockResolvedValue(10);
      
      const res = await friendshipService.sentFriendship({ input: { primary_user_id: '123e4567-e89b-12d3-a456-426614174001', secondary_user_id: '123e4567-e89b-12d3-a456-426614174002' } as any });
      
      expect(mockFriendshipModel.createFriendship).toHaveBeenCalledWith({ input: { primary_user_id: '123e4567-e89b-12d3-a456-426614174001', secondary_user_id: '123e4567-e89b-12d3-a456-426614174002' } });
      expect(res).toBe(10);
    });
  });

  describe('acceptFriendship', () => {
    it('should update state, create chat, and create relations', async () => {
      mockChatModel.createChat.mockResolvedValue(55);
      mockFriendshipModel.getFriendshipById.mockResolvedValue([{ primary_user_id: '123e4567-e89b-12d3-a456-426614174001', secondary_user_id: '123e4567-e89b-12d3-a456-426614174002' } as any]);

      await friendshipService.acceptFriendship({ id: 10 });
      
      expect(mockFriendshipModel.updateFriendship).toHaveBeenCalledWith({ input: { primary_state: 'accepted', secondary_state: 'accepted' }, id: 10 });
      expect(mockChatModel.createChat).toHaveBeenCalled();
      expect(mockFriendshipChatModel.createFriendshipChat).toHaveBeenCalled();
    });
  });
});
