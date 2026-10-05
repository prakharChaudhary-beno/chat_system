import { Router } from 'express';

import type { ChatController } from '../controllers/chat.controller.js';

import type { MessageController } from '../controllers/message.controller.js';


export function createChatRouter(chats: ChatController, messages: MessageController): Router {
  const router = Router();
    // router.post('/', chats.createChat);
  router.post('/create', chats.create);

  router.post('/:chatId/message/send', messages.send);
    // router.post('/:chatId/message/send', messages.send);


  router.get('/:chatId/messages', messages.list);
  router.post('/:chatId/message/:messageId/read', messages.markRead);
    router.post('/:chatId/message/:messageId/read', messages.markRead);
  router.post('/:chatId/lastseen', messages.updateLastSeen);
  return router;
} 