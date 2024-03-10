const CONNECTED_EVENT = 'connected'

const DISCONNECT_EVENT = 'disconnected';

const JOIN_CHAT_EVENT = 'joinChat';

// ? when a user leaves the chat, this event is fired just to let the other user know
const LEAVE_CHAT_EVENT = 'leaveChat';

// ? ------
const EXISTING_USERS_EVENT = 'existingUsers';

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

// ? User Disconnected
const USER_DISCONNECTED = "userDisconnected"

// ? User COnnected
const USER_CONNECTED = "userConnected"

// ? Call Initialted
const CALL_INITIATED = "callInitiated"

// ? Call Request Received
const CALL_OFFER_RECEIVED = "callOfferReceived"

// ? Call Room Joined
const CALL_JOINED = "callJoined"

// ? Call Room Joined
const CALL_CONNECTED = "callConnected"

// ? Call Room Joined
const CALL_REJECTED = "callRejected"

// ? Call Room Joined
const TOGGLE_AUDIO = "toggleAudio"

// ? Call Room Joined
const TOGGLE_VIDEO = "toggleVideo"

// ? User Hangsup the Call
const USER_HANG_UP = "userHangUp"

enum CHAT_EVENTS {
  connected = CONNECTED_EVENT,
  disconnected = DISCONNECT_EVENT,
  joinChat = JOIN_CHAT_EVENT,
  leaveChat = LEAVE_CHAT_EVENT,
  existingUsers = EXISTING_USERS_EVENT,
  deleteChat = DELETE_CHAT_EVENT,
  updateGroupName = UPDATE_GROUP_NAME_EVENT,
  onMessage = MESSAGE_RECEIVED_EVENT,
  newChat = NEW_CHAT_EVENT,
  error = SOCKET_ERROR_EVENT,
  stopTyping = STOP_TYPING_EVENT,
  startTyping = TYPING_EVENT,
  addToGroup = ADD_TO_GROUP_EVENT,
  removeFromGroup = REMOVE_FROM_GROUP_EVENT,
  userDisconnected = USER_DISCONNECTED,
  userConnected = USER_CONNECTED,
}

export enum CALL_EVENTS {
  callInitiated = CALL_INITIATED,
  callOfferReceived = CALL_OFFER_RECEIVED,
  callJoined = CALL_JOINED,
  callConnected = CALL_CONNECTED,
  callRejected = CALL_REJECTED,
  toggleAudio = TOGGLE_AUDIO,
  toggleVideo = TOGGLE_VIDEO,
  userHangUp = USER_HANG_UP
}

export default CHAT_EVENTS;