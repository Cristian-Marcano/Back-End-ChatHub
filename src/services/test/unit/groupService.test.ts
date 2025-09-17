import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { GroupService } from '../../groupService';
import { IChatModel } from '../../../interface/chatModel';
import { IGroupModel } from '../../../interface/groupModel';
import { IUserInfoModel } from '../../../interface/userInfoModel';

vi.mock('../../../db/mysql/transaction', () => ({
  withTransaction: vi.fn(async (callback) => {
    return await callback({});
  }),
}));

describe('GroupService', () => {
  let mockChatModel: Mocked<IChatModel>;
  let mockGroupModel: Mocked<IGroupModel>;
  let mockUserInfoModel: Mocked<IUserInfoModel>;
  let groupService: GroupService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChatModel = {
      createChat: vi.fn(),
      getChats: vi.fn(),
      getChatById: vi.fn(),
      getChatsByName: vi.fn(),
      removeChat: vi.fn(),
      getChatMembers: vi.fn(),
    } as unknown as Mocked<IChatModel>;

    mockGroupModel = {
      createGroup: vi.fn(),
      addMember: vi.fn(),
      getGroupMembers: vi.fn(),
      removeMember: vi.fn(),
      getGroupByChatId: vi.fn(),
      updateMemberRole: vi.fn(),
      updateGroupSettings: vi.fn(),
    } as unknown as Mocked<IGroupModel>;

    mockUserInfoModel = {
      getUserInfoById: vi.fn(),
      getUsersInfo: vi.fn(),
      createUserInfo: vi.fn(),
      updateUserInfo: vi.fn(),
      upsertUserInfo: vi.fn(),
    } as unknown as Mocked<IUserInfoModel>;

    groupService = new GroupService({
      chatModel: mockChatModel,
      groupModel: mockGroupModel,
      userInfoModel: mockUserInfoModel,
    } as any);
  });

  describe('kickMember', () => {
    it('should throw an error if the requester is not an admin', async () => {
      // Mock requester is a regular member
      mockGroupModel.getGroupMembers.mockResolvedValue([
        { member_id: '123e4567-e89b-12d3-a456-426614174001', role: 'member' },
        { member_id: '123e4567-e89b-12d3-a456-426614174002', role: 'member' }
      ] as any);
      
      await expect(
        groupService.kickMember({ chatId: 1, requesterId: '123e4567-e89b-12d3-a456-426614174001', targetId: '123e4567-e89b-12d3-a456-426614174002' })
      ).rejects.toThrow('Not authorized');
    });

    it('should successfully kick member if requester is an admin or owner', async () => {
      // Mock requester is an admin
      mockGroupModel.getGroupMembers.mockResolvedValue([
        { member_id: '123e4567-e89b-12d3-a456-426614174001', role: 'admin' },
        { member_id: '123e4567-e89b-12d3-a456-426614174002', role: 'member' }
      ] as any);
      
      await groupService.kickMember({ chatId: 1, requesterId: '123e4567-e89b-12d3-a456-426614174001', targetId: '123e4567-e89b-12d3-a456-426614174002' });
      
      expect(mockGroupModel.removeMember).toHaveBeenCalledWith({ input: { chatId: 1 }, memberId: '123e4567-e89b-12d3-a456-426614174002' });
    });
  });
});
