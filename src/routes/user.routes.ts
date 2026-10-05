import { Router } from 'express';
import type { UserController } from '../controllers/user.controller.js';



// export function createUserRouter(users: UserController): Router {
//   const router = Router();
//   router.get('/:userId/chats', users.listChats);
// }
export function createNewUserRouter(users: UserController): Router {
  const router = Router();
  router.get('/:userId/chats', users.listChats);
  return router;
}