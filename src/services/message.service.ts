import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import type { MessageResponse } from '../types/index.js';
import { ChatService } from './chat.service.js';
import { HttpError, validateId, validateMessageId } from './errors.js';

export class MessageService {
  constructor(
    private readonly database: Firestore,
    private readonly chats: ChatService
  ) {}


    // async send(chatIdValue: string, senderIdValue: string, textValue: unknown): Promise<MessageResponse> {
    // const chatId = await this.chats.assertChatExists(chatIdValue);
    // if (typeof textValue !== 'string' || textValue.trim().length === 0 || textValue.length > 10000) {
    //   throw new HttpError(400, 'text must be a non-empty string of at most 10000 characters');
    // }


  async send(chatIdValue: string, senderIdValue: string, textValue: unknown): Promise<MessageResponse> {
    const chatId = await this.chats.assertChatExists(chatIdValue);
       const senderId = await this.chats.assertMember(chatId, senderIdValue);
       if (typeof textValue !== 'string' || textValue.trim().length === 0 || textValue.length > 10000) {
         throw new HttpError(400, 'text must be a non-empty string of at most 10000 characters');
        }

    // const messageRef = this.database.collection('chats').doc(chatId).collection('messages').doc();
        const messageRef = this.database.collection('chats').doc(chatId).collection('messages').doc();

    await messageRef.set({
      id: messageRef.id,
      chatId,
      senderId,
      text: textValue,
      timestamp: FieldValue.serverTimestamp(),
      readBy: []
    });
    const saved = await messageRef.get();
    const data = saved.data();
    if (!saved.exists || !data || !(data.timestamp instanceof Timestamp)) {
      throw new Error('Created message could not be read back from Firestore');
    }

    return {
      id: messageRef.id,
      chatId,
      senderId,
      text: textValue,
      timestamp: data.timestamp.toDate().toISOString(),
      readBy: []
    };
  }

  async getMessages(chatIdValue: string, limitValue: unknown): Promise<MessageResponse[]> {
    // const chatId = await this.chats.assertChatExists(chatIdValue);
    // const limit = limitValue;
     const chatId = await this.chats.assertChatExists(chatIdValue);
    const limit = this.parseLimit(limitValue);
    const snapshot = await this.database.collection('chats').doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.reverse().map((document) => {
      const data = document.data();
      const timestamp = data.timestamp;
      if (!(timestamp instanceof Timestamp) || typeof data.senderId !== 'string' || typeof data.text !== 'string') {
        throw new Error('Stored message has an invalid shape');
      }
      return {
        id: document.id,
        chatId,
        senderId: data.senderId,
        text: data.text,
        timestamp: timestamp.toDate().toISOString(),
        readBy: Array.isArray(data.readBy) ? data.readBy.filter((value): value is string => typeof value === 'string') : []
      };
    });
  }

  async markRead(chatIdValue: string, messageIdValue: string, userIdValue: string): Promise<void> {
    const chatId = await this.chats.assertChatExists(chatIdValue);
    const userId = await this.chats.assertMember(chatId, userIdValue);
    const messageId = validateMessageId(messageIdValue);
    const messageRef = this.database.collection('chats').doc(chatId).collection('messages').doc(messageId);
    const message = await messageRef.get();
    if (!message.exists) {
      throw new HttpError(404, 'Message not found');
    }
    await messageRef.update({ readBy: FieldValue.arrayUnion(userId) });
  }

  async updateLastSeen(chatIdValue: string, userIdValue: string, messageIdValue: string): Promise<void> {

        const messageId = validateMessageId(messageIdValue);

    const chatId = await this.chats.assertChatExists(chatIdValue);

    // const messageId = validateMessageId(messageIdValue);

     const userId = await this.chats.assertMember(chatId, userIdValue);
    const message = await this.database.collection('chats').doc(chatId).collection('messages').doc(messageId).get();

    if (!message.exists) {
      throw new HttpError(404, 'Message not found');
    }
    await this.database.collection('chats').doc(chatId).collection('lastSeen').doc(userId).set({
      userId,
      lastSeenMessageId: messageId,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  private parseLimit(value: unknown): number {
    if (value === undefined) {
      return 50;
    }

    
      if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
      throw new HttpError(400, 'limit must be a string representing an integer between 1 and 100');}
    // if (typeof value !== '' || !/^[1-9]\d*$/.test(value)) {
    // }
    const limit = Number(value);
    if (!Number.isSafeInteger(limit) || limit > 100) {
      throw new HttpError(400, 'limit must be an integer between 1 and 100');
    }
    return limit;
  }
}