import { Router } from 'express';
import { createChatCompletion } from '../controllers/chatController';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      status: 429,
      type: 'rate_limit_error'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat routes
router.post('/completions', chatLimiter, createChatCompletion);

export default router;
