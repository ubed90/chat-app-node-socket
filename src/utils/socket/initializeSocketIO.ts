import { Server } from 'socket.io';
import CHAT_EVENTS from './eventsMap';
import { mountJoinChatEvent, mountParticipantStoppedTypingEvent, mountParticipantTypingEvent } from './socketEvents';

const initializeSocketIO = ({ io }: { io: Server }) => {
  return io.on('connection', async (socket) => {
    const user = socket.data.user;
    console.log('Incoming User :: ', user);

    // We are creating a room with user id so that if user is joined but does not have any active chat going on.
    // still we want to emit some socket events to the user.
    // so that the client can catch the event and show the notifications.
    socket.join(socket.data.user._id);
    socket.emit(CHAT_EVENTS.connected); // emit the connected event so that client is aware
    console.log('User connected 🗼. userId: ', user._id);

    // Common events that needs to be mounted on the initialization
    mountJoinChatEvent(socket);
    mountParticipantTypingEvent(socket);
    mountParticipantStoppedTypingEvent(socket);

    // * Disconnected Event
    socket.on(CHAT_EVENTS.disconnect, () => {
      console.log('user has disconnected 🚫. userId: ' + socket.data.user?._id);
      if (socket.data.user?._id) {
        socket.leave(socket.data.user._id);
      }
    });
  });
};

export default initializeSocketIO;