import { Router } from 'express';
import { authRateLimit } from '../middleware/rateLimit';
import { validate, validators } from '../middleware/validate';
import { signUp, signIn, refreshToken, signOut } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', authRateLimit, validate([
  { field: 'fullname', validators: [validators.required(), validators.string(), validators.minLength(2), validators.maxLength(100)] },
  { field: 'email', validators: [validators.required(), validators.string(), validators.email()] },
  { field: 'password', validators: [validators.required(), validators.string(), validators.minLength(6)] },
]), signUp);

router.post('/signin', authRateLimit, validate([
  { field: 'email', validators: [validators.required(), validators.string(), validators.email()] },
  { field: 'password', validators: [validators.required(), validators.string()] },
]), signIn);

router.post('/refresh', authRateLimit, refreshToken);
router.post('/signout', signOut);

export default router;
