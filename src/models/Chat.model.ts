import { Model, Schema, Types, model } from "mongoose";

interface IChat {
    _id?: string;
    name?: string;
    isGroupChat?: boolean;
    users: Types.Array<Types.ObjectId>;
    lastMessage: Types.ObjectId;
    admin: Types.ObjectId;
}

interface IChatMethods {}

type ChatModel = Model<IChat, {}, IChatMethods>;

const schema = new Schema<IChat, ChatModel, IChatMethods>({
    name: {
        type: String,
        default: 'One on One Chat'
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    users: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }],
    admin: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true });

// * Pre Delete Hook
schema.pre('deleteOne', { document: true },async function() {
    await this.model('Message').deleteMany({ chat: this._id });
});

const Chat = model<IChat, ChatModel>('Chat', schema);

export default Chat;