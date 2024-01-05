import { Model, Schema, Types, model } from "mongoose";

interface IChat {
    _id?: string;
    isGroupChat?: boolean;
    users: Types.Array<Types.ObjectId>;
    lastMessage: Types.ObjectId;
    groupAdmin: Types.ObjectId;
}

interface IChatMethods {}

type ChatModel = Model<IChat, {}, IChatMethods>;

const schema = new Schema<IChat, ChatModel, IChatMethods>({
    isGroupChat: {
        type: Boolean,
        default: false
    },
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    groupAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }
});

const Chat = model<IChat, ChatModel>('Chat', schema);

export default Chat;