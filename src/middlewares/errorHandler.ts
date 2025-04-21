import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ErrorResponse } from '../types';

export class ApiError extends Error {
  statusCode: number;
  type: string;

  constructor(statusCode: number, message: string, type: string = 'api_error') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`, 'not_found');
  next(error);
};

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  let statusCode = 500;
  let type = 'server_error';
  let message = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    type = err.type;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message || 'Something went wrong';
  }

  // Log the error
  logger.error(`[${statusCode}] ${message}${err.stack ? `\n${err.stack}` : ''}`);

  // Hide error details in production unless it's a 4xx error
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      type
    }
  });
};
