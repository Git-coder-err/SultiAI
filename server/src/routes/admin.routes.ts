import { Router } from 'express';
import { adminMiddleware } from '../middleware/admin';
import {
  getOverview,
  listUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  verifyUser,
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  listPosts,
  toggleFeatured,
  setPostHidden,
  deletePost,
  listReports,
  updateReportStatus,
  getAiUsage,
  getXpOverview,
  listFeedback,
  resolveFeedback,
  listPreserved,
  verifyPreserved,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require admin role
router.use(adminMiddleware);

// Dashboard
router.get('/analytics/overview', getOverview);

// Users
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.post('/users/:id/verify', verifyUser);

// Lessons
router.get('/lessons', listLessons);
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// Community
router.get('/community/posts', listPosts);
router.patch('/community/posts/:id', toggleFeatured);
router.delete('/community/posts/:id', deletePost);
router.get('/community/reports', listReports);
router.patch('/community/reports/:id', updateReportStatus);

// AI Usage
router.get('/ai/usage', getAiUsage);

// XP & Rewards
router.get('/xp/overview', getXpOverview);

// Feedback
router.get('/feedback', listFeedback);
router.patch('/feedback/:id', resolveFeedback);

// Preservation
router.get('/preservation', listPreserved);
router.post('/preservation/:id', verifyPreserved);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
