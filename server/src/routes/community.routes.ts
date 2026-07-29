import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getPosts,
  getResources,
  getUserIdByEmail,
  createPost,
  getComments,
  createComment,
} from '../db/repositories/community.repo';
import {
  createVerificationRequest,
  getPendingVerifications,
  approveVerification,
  getUserVerifications,
  getVerifierStats,
} from '../db/repositories/verification.repo';

const router = Router();

router.get('/posts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const posts = await getPosts();
    res.json(posts.map((p: any) => ({
      id: p.postId,
      user_id: p.userId,
      title: p.title,
      content: p.content,
      author: p.authorName,
      created_at: p.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

router.post('/posts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body || {};
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    const userId = await getUserIdByEmail(req.user!.email);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const postId = await createPost(userId, { title, content });
    res.json({ id: postId, title, content, created_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.get('/resources', authMiddleware, async (req: Request, res: Response) => {
  try {
    const resources = await getResources();
    res.json(resources.map((r: any) => ({
      id: String(r.postId),
      phrase: r.phrase,
      translation: r.translation,
      category: r.category,
      title: r.title,
      content: r.content,
      created_by: r.authorName,
      createdAt: r.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get resources' });
  }
});

router.post('/resources', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { phrase, translation, category, title, content } = req.body || {};
    const userId = await getUserIdByEmail(req.user!.email);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const postId = await createPost(userId, { title, content, phrase, translation, category });
    res.json({
      id: String(postId),
      phrase,
      translation,
      category,
      title,
      content,
      created_by: req.user!.email,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

router.get('/posts/:postId/comments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const comments = await getComments(Number(req.params.postId as string));
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

router.post('/posts/:postId/comments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { comment } = req.body || {};
    if (!comment) {
      res.status(400).json({ error: 'Comment is required' });
      return;
    }
    const userId = await getUserIdByEmail(req.user!.email);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const commentId = await createComment(Number(req.params.postId as string), userId, comment);
    res.json({
      comment_id: commentId,
      post_id: parseInt(req.params.postId as string),
      user_id: userId,
      comment,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// === Native Speaker Verification Routes ===

router.post('/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { audio, phrase_id } = req.body || {};
    const userId = await getUserIdByEmail(req.user!.email);
    if (!userId) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const requestId = await createVerificationRequest(userId, {
      audioPath: audio ? 'inline_base64' : undefined,
      recordedText: req.body.text,
      wordId: phrase_id ? parseInt(phrase_id) : undefined,
    });
    res.json({ request_id: requestId, status: 'pending', message: 'Submitted for native speaker verification' });
  } catch (err) {
    console.error('Verification request error:', err);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
});

router.get('/verify/requests', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pending = await getPendingVerifications();
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get verification requests' });
  }
});

router.post('/verify/:id/approve', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    const { score, feedback } = req.body || {};
    await approveVerification(requestId, req.user!.email, { score, feedback });
    res.json({ message: 'Verification approved. Thank you for contributing!' });
  } catch (err) {
    console.error('Approve verification error:', err);
    res.status(500).json({ error: 'Failed to approve verification' });
  }
});

router.get('/verify/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await getVerifierStats(req.user!.email);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get verifier stats' });
  }
});

export default router;
