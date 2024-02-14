const CONNECTED_EVENT = 'connected'

const DISCONNECT_EVENT = 'disconnected';

const JOIN_CHAT_EVENT = 'joinChat';

const DELETE_CHAT_EVENT = "deleteChat";
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

// ? when participant is Added to Group
const ADD_TO_GROUP_EVENT = "addToGroup";

// ? when participant is REMOVED to Group
const REMOVE_FROM_GROUP_EVENT = "removeFromGroup";

enum CHAT_EVENTS {
  connected = CONNECTED_EVENT,
  disconnected = DISCONNECT_EVENT,
  joinChat = JOIN_CHAT_EVENT,
  deleteChat = DELETE_CHAT_EVENT,
  updateGroupName = UPDATE_GROUP_NAME_EVENT,
  onMessage = MESSAGE_RECEIVED_EVENT,
  newChat = NEW_CHAT_EVENT,
  error = SOCKET_ERROR_EVENT,
  stopTyping = STOP_TYPING_EVENT,
  startTyping = TYPING_EVENT,
  addToGroup = ADD_TO_GROUP_EVENT,
  removeFromGroup = REMOVE_FROM_GROUP_EVENT,
}

export default CHAT_EVENTS;