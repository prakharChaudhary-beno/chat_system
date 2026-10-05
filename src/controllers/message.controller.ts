import type { Request, Response } from 'express';

import { MessageService } from '../services/message.service.js';
// import { MessageService } from '../services/message.service.js';

import type { SendMessageBody, UserBody, LastSeenBody } from '../types/index.js';

export class MessageController {
  constructor(private readonly messages: MessageService) {}

//  send = async (request: Request<{ chatId: string }>, response: Response) => {
//     const body = request.body as SendMessageBody;
//     const message = await this.messages.send(request.params.chatId, body?.senderId, body?.text);
//     response.status(201).json({ success: true, message });
//   };

  send = async (request: Request<{ chatId: string }>, response: Response): Promise<void> => {
    // const body = request.body as SendMessageBody;

        const body = request.body as SendMessageBody;

    const message = await this.messages.send(request.params.chatId, body?.senderId, body?.text);
    response.status(201).json({ success: true, message });
  };



   


  markRead = async (request: Request<{ chatId: string; messageId: string }>, response: Response): Promise<void> => {
    const body = request.body as UserBody;
    // await this.messages.markRead( request.params.messageId, body?.userId);
        await this.messages.markRead(request.params.chatId, request.params.messageId, body?.userId);

    response.status(200).json({ success: true, message: 'Message marked as read' });
  };

  updateLastSeen = async (request: Request<{ chatId: string }>, response: Response): Promise<void> => {
    const body = request.body as LastSeenBody;
    // await this.messages.updateLastSeen( body?.messageId);
        await this.messages.updateLastSeen(request.params.chatId, body?.userId, body?.messageId);

    response.status(200).json({ success: true, message: 'Last-seen message updated' });
  };


     list = async (request: Request<{ chatId: string }>, response: Response): Promise<void> => {


    const messages = await this.messages.getMessages(request.params.chatId, request.query.limit);
    response.status(200).json({ success: true, messages });
  };
}