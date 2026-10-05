import type { Request, Response } from 'express';


import { ChatService } from '../services/chat.service.js';

export class UserController {
  constructor(private readonly chats: ChatService) {}

  listChats = async (request: Request<{ userId: string }>, response: Response): Promise<void> => {
    // const chats = await this.chats.getChatsForUser(request.userId);

    
        const chats = await this.chats.getChatsForUser(request.params.userId);

    response.status(200).json({ success: true, chats });
  };
}