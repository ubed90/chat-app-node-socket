import { Model, Schema, Types, model } from "mongoose";

interface IMessage {
    _id?: string;
    sender: Types.ObjectId;
    content: string;
    chat: Types.ObjectId,
}

interface IMessageMethods {}

type MessageModel = Model<IMessage, {}, IMessageMethods>;

const schema = new Schema<IMessage, MessageModel, IMessageMethods>({
    content: {
        type: String,
        required: [true, 'Please provide message body']
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat'
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Message = model<IMessage, MessageModel>('Message', schema);

export default Message;