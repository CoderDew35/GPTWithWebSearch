import { Request, Response, NextFunction } from 'express';
import { getChatCompletion } from '../services/openaiService';
import { ApiError } from '../middlewares/errorHandler';
import { ChatRequest, ChatResponse } from '../types';
import { logger } from '../utils/logger';

export const createChatCompletion = async (
  req: Request<{}, {}, ChatRequest>,
  res: Response<ChatResponse | { error: string }>,
  next: NextFunction
) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new ApiError(400, 'Messages are required and must be an array with at least one message', 'validation_error');
    }


    logger.info(`Chat request received with ${messages.length} messages`);
    
    const content = await getChatCompletion({
      messages,
    });

    res.status(200).json({
      content,
      role: 'assistant'
    });
  } catch (error) {
    next(error);
  }
};
