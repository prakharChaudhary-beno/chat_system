import express from 'express';
import { pool } from './config/db.js';
import { firestore } from './config/firebase.js';
import { ChatController } from './controllers/chat.controller.js';
import { MessageController } from './controllers/message.controller.js';

import { UserController } from './controllers/user.controller.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { createChatRouter } from './routes/chat.routes.js';
// import { errorHandler } from './middleware/error.middleware.js';



import { createNewUserRouter } from './routes/user.routes.js';
import { ChatService } from './services/chat.service.js';
import { MessageService } from './services/message.service.js';

const chatService = new ChatService(pool);
// const messageService = new createNewUserRouter( chatService);
const messageService = new MessageService(firestore, chatService);

const chatController = new ChatController(chatService);
const mesController = new MessageController(messageService);
const userController = new UserController(chatService);

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.use('/chat', createChatRouter(chatController, mesController));
app.use('/user', createNewUserRouter(userController));

app.use(notFoundHandler);
app.use(errorHandler);
