export interface ChatSummary {
  chatId: string;
  memberIds: string[];
  createdAt: string;
}

export interface MessageResponse {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  readBy: string[];
}

export interface SendMessageBody {
  senderId: string;
  text: string;
}

export interface UserBody {
  userId: string;
}

export interface LastSeenBody extends UserBody {
  messageId: string;
}
