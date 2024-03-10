import { Socket } from 'socket.io';
import CHAT_EVENTS, { CALL_EVENTS } from './eventsMap';
import { Request } from 'express';
import { usersRegistry } from '../usersMap';

const mountJoinChatEvent = (socket: Socket) => {
  socket.on(CHAT_EVENTS.joinChat, (props: { chatId: string, userId: string }) => {
    console.log(props.userId + ' joined the chat 🤝. chatId: ' + props.chatId);
    socket.join(props.chatId);
    socket.in(props.chatId).emit(CHAT_EVENTS.joinChat, props);
  });
};

const mountLeaveChatEvent = (socket: Socket) => {
  socket.on(CHAT_EVENTS.leaveChat, (props: { chatId: string, userId: string }) => {
    console.log(props.userId + ' Left the chat 📢. chatId: ' + props.chatId);
    socket.in(props.chatId).emit(CHAT_EVENTS.leaveChat, props);
    socket.leave(props.chatId);
  })
}

const mountExistingUsersEvent = (socket: Socket) => {
  socket.on(
    CHAT_EVENTS.existingUsers,
    (props: { chatId: string; userId: string, otherUser: string }) => {
      socket.broadcast.in(props.otherUser).emit(CHAT_EVENTS.existingUsers, props);
    }
  );
}

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
    async ({ caller, receiver, roomId, callType, groupName }, isUserOnline: (isOnline: boolean) => void) => {
      
      let isOnline = false;
      
      for(let i = 0; i < receiver.length && !isOnline; i++) {
        isOnline = usersRegistry.getUserStatus(receiver[i]);
      }
      
      socket.broadcast
        .in(receiver).emit(CALL_EVENTS.callOfferReceived, { caller, roomId, callType, groupName });

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
  socket.on(CALL_EVENTS.callJoined, ({ roomId, user, peerId }) => {
    console.log(user.name + ' JOINED ROOM :: ', roomId);
    socket.join(roomId);
    socket.in(roomId).emit(CALL_EVENTS.callConnected, { user, peerId });
  });
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
  mountLeaveChatEvent,
  mountExistingUsersEvent,
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
