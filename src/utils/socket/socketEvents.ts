import { Socket } from 'socket.io';
import CHAT_EVENTS from './eventsMap';
import { Request } from 'express';

const mountJoinChatEvent = (socket: Socket) => {
  socket.on(CHAT_EVENTS.joinChat, (chatId: string) => {
    console.log(`User joined the chat 🤝. chatId: `, chatId);
    socket.join(chatId);
  });
};

const mountParticipantTypingEvent = (socket: Socket) => {
  socket.on(CHAT_EVENTS.startTyping, (chatId) => {
    socket.in(chatId).emit(CHAT_EVENTS.startTyping, chatId);
  });
};

const mountParticipantStoppedTypingEvent = (socket: Socket) => {
  socket.on(CHAT_EVENTS.stopTyping, (chatId) => {
    socket.in(chatId).emit(CHAT_EVENTS.stopTyping, chatId);
  });
};

const emitSocketEvent = (
  req: Request,
  roomId: string,
  event: string,
  payload?: any
) => {
  req.app.get('io').in(roomId).emit(event, payload);
};

export {
  mountJoinChatEvent,
  mountParticipantTypingEvent,
  mountParticipantStoppedTypingEvent,
  emitSocketEvent
};
