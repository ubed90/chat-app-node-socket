import { Server } from 'socket.io';
import CHAT_EVENTS from './eventsMap';
import { mountCallInitiatedEvent, mountCallJoinEvent, mountCallRejectedEvent, mountExistingUsersEvent, mountHangUpEvent, mountJoinChatEvent, mountLeaveChatEvent, mountParticipantStoppedTypingEvent, mountParticipantTypingEvent, mountToggleAudioEvent, mountToggleVideoEvent } from './socketEvents';
import UsersMap from '../usersMap';

const initializeSocketIO = ({ io, usersRegistry }: { io: Server, usersRegistry: UsersMap }) => {
  return io.on('connection', async (socket) => {
    const user = socket.data.user;
    // We are creating a room with user id so that if user is joined but does not have any active chat going on.
    // still we want to emit some socket events to the user.
    // so that the client can catch the event and show the notifications.
    socket.join(user._id.toString());
    // * Add Our user to Online Users registry
    usersRegistry.addUser = { id: user._id.toString(), value: socket.id }
    socket.emit(CHAT_EVENTS.connected); // emit the connected event so that client is aware
    socket.broadcast.emit(CHAT_EVENTS.userConnected, user?._id.toString());

    // Common events that needs to be mounted on the initialization
    mountJoinChatEvent(socket);
    mountLeaveChatEvent(socket);
    mountExistingUsersEvent(socket);
    mountParticipantTypingEvent(socket);
    mountParticipantStoppedTypingEvent(socket);
    mountCallInitiatedEvent(socket);
    mountCallJoinEvent(socket);
    mountCallRejectedEvent(socket);
    mountToggleAudioEvent(socket);
    mountToggleVideoEvent(socket);
    mountHangUpEvent(socket);

    // * Disconnected Event
    socket.on(CHAT_EVENTS.disconnected, () => {
      if (socket.data.user?._id?.toString()) {
        socket.leave(socket.data.user?._id?.toString());
      }

      if(usersRegistry.getUserStatus(user._id.toString())) {
        usersRegistry.deleteUser(user._id.toString());
        socket.broadcast.emit(CHAT_EVENTS.userDisconnected, user?._id.toString())
      }
    });
  });
};

export default initializeSocketIO;