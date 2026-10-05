import type { Request, Response } from 'express';
import { ChatService } from '../services/chat.service.js';

export class ChatController {
  constructor(private readonly chats: ChatService) {}

  create = async (request: Request, response: Response): Promise<void> => {
    const chatId = await this.chats.createOrGetChat(request.body);
    response.status(200).json({ success: true, chatId });
  };
}