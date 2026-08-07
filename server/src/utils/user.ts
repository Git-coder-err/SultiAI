import { getUserIdByEmail } from '../db/repositories/conversation.repo';

export async function getUserIdFromEmail(email: string): Promise<number | undefined> {
  return getUserIdByEmail(email);
}
