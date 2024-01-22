const CONNECTED_EVENT = 'connected'

const DISCONNECT_EVENT = 'disconnect';

const JOIN_CHAT_EVENT = 'joinChat';

const LEAVE_CHAT_EVENT = "leaveChat";
  // ? when admin updates a group name
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
// ? when new message is received
const MESSAGE_RECEIVED_EVENT = "messageReceived";
// ? when there is new one on one chat, new group chat or user gets added in the group
const NEW_CHAT_EVENT = "newChat";
// ? when there is an error in socket
const SOCKET_ERROR_EVENT = "socketError";
// ? when participant stops typing
const STOP_TYPING_EVENT = "stopTyping";
// ? when participant starts typing
const TYPING_EVENT = "typing";

enum CHAT_EVENTS {
  connected = CONNECTED_EVENT,
  disconnect = DISCONNECT_EVENT,
  joinChat = JOIN_CHAT_EVENT,
  leaveChat = LEAVE_CHAT_EVENT,
  updateGroupName = UPDATE_GROUP_NAME_EVENT,
  onMessage = MESSAGE_RECEIVED_EVENT,
  newChat = NEW_CHAT_EVENT,
  error = SOCKET_ERROR_EVENT,
  stopTyping = STOP_TYPING_EVENT,
  startTyping = TYPING_EVENT
}

export default CHAT_EVENTS;