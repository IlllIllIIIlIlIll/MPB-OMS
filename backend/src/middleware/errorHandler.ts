import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = { message: 'Duplicate field value entered', statusCode: 400 } as AppError;
        break;
      case 'P2025':
        error = { message: 'Record not found', statusCode: 404 } as AppError;
        break;
      case 'P2003':
        error = { message: 'Foreign key constraint failed', statusCode: 400 } as AppError;
        break;
      default:
        error = { message: 'Database operation failed', statusCode: 400 } as AppError;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    error = { message: 'Invalid data provided', statusCode: 400 } as AppError;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    error = { message: 'Database connection failed', statusCode: 500 } as AppError;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 } as AppError;
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 } as AppError;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = { message, statusCode: 400 } as AppError;
  }

  // Cast errors (MongoDB)
  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 } as AppError;
  }

  // Duplicate key errors
  if ((err as any).code === 11000) {
    error = { message: 'Duplicate field value entered', statusCode: 400 } as AppError;
  }

  // Network errors
  if ((err as any).code === 'EADDRINUSE') {
    error = { message: 'Port is already in use', statusCode: 500 } as AppError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 