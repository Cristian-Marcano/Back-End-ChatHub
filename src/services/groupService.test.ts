import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupService } from './groupService';
import { IChatModel } from '../interface/chatModel';
import { IGroupModel } from '../interface/groupModel';
import { IUserInfoModel } from '../interface/userInfoModel';

vi.mock('../db/mysql/transaction', () => ({
  withTransaction: vi.fn(async (callback) => {
    return await callback({});
  }),
}));

describe('GroupService', () => {
  let mockChatModel: vi.Mocked<IChatModel>;
  let mockGroupModel: vi.Mocked<IGroupModel>;
  let mockUserInfoModel: vi.Mocked<IUserInfoModel>;
  let groupService: GroupService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChatModel = {
      createGroupChat: vi.fn(),
    };

    mockGroupModel = {
      createGroup: vi.fn(),
      addMember: vi.fn(),
      getGroupMembers: vi.fn(),
      removeMember: vi.fn(),
      getGroupInfo: vi.fn(),
    };

    mockUserInfoModel = {};

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
        { member_id: 'req1', role: 'member' },
        { member_id: 'tar1', role: 'member' }
      ]);
      
      await expect(
        groupService.kickMember({ chatId: 1, requesterId: 'req1', targetId: 'tar1' })
      ).rejects.toThrow('Not authorized');
    });

    it('should successfully kick member if requester is an admin or owner', async () => {
      // Mock requester is an admin
      mockGroupModel.getGroupMembers.mockResolvedValue([
        { member_id: 'req1', role: 'admin' },
        { member_id: 'tar1', role: 'member' }
      ]);
      
      await groupService.kickMember({ chatId: 1, requesterId: 'req1', targetId: 'tar1' });
      
      expect(mockGroupModel.removeMember).toHaveBeenCalledWith({ input: { chatId: 1 }, memberId: 'tar1' });
    });
  });
});
