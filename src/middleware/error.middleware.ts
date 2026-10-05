import type { ErrorRequestHandler } from 'express';

import type { RequestHandler } from 'express';

// import { ChatService } from 'chat.service.js';
import { HttpError } from '../services/errors.js';

export const notFoundHandler: RequestHandler = (_request, response) => {

  
  response.status(404).json({ success: false, message: 'Route not found' });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {

  // if (error notFoundHandler instanceof SyntaxError) {
  //   response.status(400).json({ success: false, message: 'Invalid request body' });
  //   return;
  // }
    if (error instanceof SyntaxError) {
    response.status(400).json({ success: false, message: 'Invalid request body' });
    return;
  }
    if (error instanceof HttpError) {
    response.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  response.status(500).json({ success: false, message: 'Internal server error' });
};