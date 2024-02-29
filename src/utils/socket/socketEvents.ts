import { Socket } from 'socket.io';
import CHAT_EVENTS, { CALL_EVENTS } from './eventsMap';
import { Request } from 'express';
import { usersRegistry } from '../usersMap';
import { IUser } from '@/models/User.model';

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

const mountCallInitiatedEvent = (socket: Socket) => {
  socket.on(
    CALL_EVENTS.callInitiated,
    async ({ caller, receiver, roomId, callType }, isUserOnline: (isOnline: boolean) => void) => {
      const isOnline = usersRegistry.getUserStatus(receiver as string);
      socket.broadcast
        .in(receiver).emit(CALL_EVENTS.callOfferReceived, { caller, roomId, callType });

      // let acceptedTheInvite = false;
      // if(isOnline) {
      //   try {
      //     acceptedTheInvite = await socket.broadcast
      //       .in(receiver as string)
      //       .timeout(40000)
      //       .emitWithAck(CALL_EVENTS.callOfferReceived, { caller, roomId });
      //   } catch (error) {
      //     acceptedTheInvite = false;
      //   }
      // }
      console.log("SENT ACK TO CALLER :: ",isOnline);
      isUserOnline(isOnline)
    }
  );
};

const mountCallJoinEvent = (socket: Socket) => {
  socket.on(CALL_EVENTS.callJoined, (callRoomId, user) => {
    console.log(user.name + ' JOINED ROOM :: ', callRoomId);
    socket.join(callRoomId)
    socket.in(callRoomId).emit(CALL_EVENTS.callConnected, user)
  })
}

const mountCallRejectedEvent = (socket: Socket) => {
  socket.on(CALL_EVENTS.callRejected, ({ callerId, reason }) => {
    socket.broadcast.in(callerId).emit(CALL_EVENTS.callRejected, reason);
  })
}

const mountToggleAudioEvent = (socket: Socket) => {
  socket.on(CALL_EVENTS.toggleAudio, ({ userId, roomId }) => {
    console.log(`EVENT EMITTED IN BY ${userId}::`, roomId);
    socket.in(roomId).emit(CALL_EVENTS.toggleAudio, userId);
  });
};

const mountToggleVideoEvent = (socket: Socket) => {
  socket.on(CALL_EVENTS.toggleVideo, ({ userId, roomId }) => {
    console.log(`EVENT EMITTED IN BY ${userId}::`, roomId);
    socket.in(roomId).emit(CALL_EVENTS.toggleVideo, userId);
  });
};

const mountHangUpEvent = (socket: Socket) => {
  socket.on(CALL_EVENTS.userHangUp, ({ user, roomId }) => {
    console.log(`USER HANGING UP IN ROOM ${roomId}::`, user._id);
    socket.in(roomId).emit(CALL_EVENTS.userHangUp, user);
    // socket.leave(roomId);
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
  emitSocketEvent,
  mountCallInitiatedEvent,
  mountCallJoinEvent,
  mountCallRejectedEvent,
  mountToggleAudioEvent,
  mountToggleVideoEvent,
  mountHangUpEvent,
};
