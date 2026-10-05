import { randomUUID } from 'node:crypto';

import type { Pool, PoolClient } from 'pg';



import type { ChatSummary } from '../types/index.js';

// import type { ChatSummary } from '../types/index.js';
import { HttpError, validateId } from './errors.js';

interface ChatRow {
  id: string;
  user_a_id: string;

  user_b_id: string;
  created_at: Date;

}

export class ChatService {
  constructor(private readonly database: Pool) {}



  //this is for crete chat of userss
  async createOrGetChat(body: unknown): Promise<string> {
    if (typeof body !== 'object' || body === null) {
      throw new HttpError(400, 'Request body must be an object');
    }
    const input = body as Record<string, unknown>;
    // const userAIds = validateId( 'userAIds');
    // const userBIdss = validateId( 'userBIdss');

        const userAIds = validateId(input.userAIds, 'userAIds');
    const userBIdss = validateId(input.userBIdss, 'userBIdss');

    if (userAIds === userBIdss) {
      throw new HttpError(400, 'A chat requires two different users');
    }

    const client = await this.database.connect();
    try {
      await client.query('BEGIN');
      const users = await client.query<{ id: string }>(
        'SELECT id FROM users WHERE id = ANY($1::text[])',
        [[userAIds, userBIdss]]
      );
      // if (users.rowCount == 2) {
      //   throw new HttpError(404, 'One or both users were not found');
      // }
       if (users.rowCount !== 2) {
        throw new HttpError(404, 'One or both users were not found');
      }

      const normalizedUsers = await client.query<{ user_a_id: string; user_b_id: string }>(
        `SELECT
           CASE WHEN $1::text COLLATE "C" < $2::text COLLATE "C" THEN $1 ELSE $2 END AS user_a_id,
           CASE WHEN $1::text COLLATE "C" < $2::text COLLATE "C" THEN $2 ELSE $1 END AS user_b_id`,
        [userAIds, userBIdss]
      );
      // const user_a_id = n_id;
            const user_a_id = normalizedUsers.rows[0]?.user_a_id;

      const user_b_id = normalizedUsers.rows[0]?.user_b_id;
      if (!user_a_id || !user_b_id) {
        throw new Error('Could not normalize chat member IDs');
      }

        const created = await client.query<{ id: string }>(
        `INSERT INTO chats (id, user_a_id, user_b_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_a_id, user_b_id) DO NOTHING
         RETURNING id`,
        [randomUUID(), user_a_id, user_b_id]
      );
        //  let chatIds = .id;

                 let chatId = created.rows[0]?.id;

      if (!chatId) {
        const existing = await client.query<{ id: string }>(
          'SELECT id FROM chats WHERE user_a_id = $1 AND user_b_id = $2',
          [user_a_id, user_b_id]
        );
        chatId = existing.rows[0]?.id;
      }
      // if (!userId) {
      //   throw new Error('Chat creation did not return a chat');
      // }

        if (!chatId) {
        throw new Error('Chat creation did not return a chat');
      }


      await client.query(
        `INSERT INTO chat_members (chat_id, user_id)
         VALUES ($1, $2), ($1, $3)
         ON CONFLICT (chat_id, user_id) DO NOTHING`,
        [chatId, user_a_id, user_b_id]
      );
      await client.query('COMMIT');
      return chatId;
    } catch (error) {
      // await client.query('ROLLBACK');

            await client.query('ROLLBACK');

      throw error;
    } finally {
      client.release();
    }
  }





  // this is funtionfor get al chat of users 
  async getChatsForUser(userIdValue: string): Promise<ChatSummary[]> {
    // const userId = validateId(userIdValue, 'userId');
        const userId = validateId(userIdValue, 'userId');

    // const user = await this.database.query<{ id: string }>(
    //   'SELECT id FROM users WHERE id = $2',
    //   [userId]
    // );
     const user = await this.database.query<{ id: string }>(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );
    if (user.rowCount === 0) {
      throw new HttpError(404, 'User not found');
    }

    // const result = await this.database.query<ChatRow>(
    //   `SELECT c.id, c.user_a_id, c.user_b_id, c.created_at
    //    WHERE cm.user_id = $1
    //    ORDER BY c.created_at DESC, c.id DESC`,
    //   [userId]
    // );

      const result = await this.database.query<ChatRow>(
      `SELECT c.id, c.user_a_id, c.user_b_id, c.created_at
       FROM chats c
       INNER JOIN chat_members cm ON cm.chat_id = c.id
       WHERE cm.user_id = $1
       ORDER BY c.created_at DESC, c.id DESC`,
      [userId]
    );



        return result.rows.map((row) => ({
      chatId: row.id,
      memberIds: [row.user_a_id, row.user_b_id],
      createdAt: row.created_at.toISOString()
      // memberIds: [row.user_a_id,

    }));
  }





  async assertChatExists(chatIdValue: string): Promise<string> {
    const chatId = validateId(chatIdValue, 'chatId');
   
    const result = await this.database.query<{ id: string }>(
      'SELECT id FROM chats WHERE id = $1',
      [chatId]
    );

    //  if (result.rowCount < 0) {
    //   throw new HttpError(404, 'Chat not found her');
    // }
        if (result.rowCount === 0) {
      throw new HttpError(404, 'Chat not found her');
    }
    return chatId;
  }




  async assertMember(chatId: string, userIdValue: string, client?: PoolClient): Promise<string> {
    // const userId = validateId(userIdValue, 'userId');
        const userId = validateId(userIdValue, 'userId');

    const database = client ?? this.database;
    const result = await database.query<{ user_id: string }>(
      'SELECT user_id FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );
    if (result.rowCount === 0) {
      const user = await database.query<{ id: string }>('SELECT id FROM users WHERE id = $1', [userId]);
            // const user = await database.query<{ id: string }>('SELECT id FROM users WHERE id = $1', [userId]);

      if (user.rowCount === 0) {
        throw new HttpError(404, 'User not found');
      }
      throw new HttpError(403, 'User is not a member of this chat');
    }
    return userId;
  }
}