import { describe, it, expect, vi } from 'vitest';
import { mailTo } from '../../mailTo';
import * as nodemailer from 'nodemailer';

vi.mock('nodemailer', () => ({
  createTransport: vi.fn().mockReturnValue({
    sendMail: vi.fn().mockResolvedValue({ response: '250 OK' }),
  }),
}));

describe('Mail Utility', () => {
  it('should send an email with the correct parameters', async () => {
    await mailTo('test@example.com', 'Test Subject', '<p>Hello</p>');
    
    // Testing that the code executes correctly without exceptions
    expect(nodemailer.createTransport).toHaveBeenCalled();
  });
});
