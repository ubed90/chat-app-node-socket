import { Socket } from "socket.io";
import CHAT_EVENTS from "./eventsMap";

const mountJoinChatEvent = (socket: Socket) => {
    socket.on(CHAT_EVENTS.joinChat, (chatId: string) => {
        console.log(`User joined the chat 🤝. chatId: `, chatId);
        socket.join(chatId);
    });
};

const mountParticipantTypingEvent = (socket: Socket) => {
    socket.on(CHAT_EVENTS.startTyping, (chatId) => {
        socket.in(chatId).emit(CHAT_EVENTS.startTyping, chatId)
    });
};

const mountParticipantStoppedTypingEvent = (socket: Socket) => {
  socket.on(CHAT_EVENTS.stopTyping, (chatId) => {
    socket.in(chatId).emit(CHAT_EVENTS.stopTyping, chatId);
  });
};

export { mountJoinChatEvent, mountParticipantTypingEvent, mountParticipantStoppedTypingEvent }