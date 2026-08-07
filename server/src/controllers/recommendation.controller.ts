import { Request, Response } from 'express';
import { recommendationEngine } from '../services/adaptive';
import { success, errors } from '../utils/apiResponse';
import logger from '../utils/logger';

export async function getStudyPlan(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getUserIdFromEmail(req.user!.email);
    if (!userId) {
      errors.notFound(res, 'User not found');
      return;
    }

    const plan = await recommendationEngine.generateStudyPlan(userId);
    success(res, plan);
  } catch (err) {
    logger.error('Get study plan error', { error: (err as Error).message });
    errors.internal(res, 'Failed to generate study plan');
  }
}

export async function getPersonalizedGreeting(req: Request, res: Response): Promise<void> {
  try {
    const userId = await getUserIdFromEmail(req.user!.email);
    if (!userId) {
      errors.notFound(res, 'User not found');
      return;
    }

    const greeting = await recommendationEngine.getPersonalizedGreeting(userId);
    success(res, { greeting });
  } catch (err) {
    logger.error('Get greeting error', { error: (err as Error).message });
    errors.internal(res, 'Failed to get greeting');
  }
}

async function getUserIdFromEmail(email: string): Promise<number | undefined> {
  const { getUserIdByEmail } = await import('../db/repositories/conversation.repo');
  return getUserIdByEmail(email);
}
