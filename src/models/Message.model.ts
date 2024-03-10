import { Model, Schema, Types, model } from "mongoose";
import Attachment, { IAttachment } from "./Attachment.model";

export interface IMessage {
    _id?: string;
    sender: Types.ObjectId;
    content: string;
    chat: Types.ObjectId,
    status: 'SENT' | 'DELIVERED' | 'READ',
    isNotification?: boolean;
    isAttachment?: boolean;
    attachment?: IAttachment;
}

interface IMessageMethods {}

type MessageModel = Model<IMessage, {}, IMessageMethods>;

const schema = new Schema<IMessage, MessageModel, IMessageMethods>(
  {
    content: {
      type: String,
      required: [true, 'Please provide message body'],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'READ'],
      default: 'SENT'
    },
    isNotification: {
      type: Boolean,
      default: false,
    },
    isAttachment: {
      type: Boolean,
      default: false,
    },
    attachment: Attachment,
  },
  {
    timestamps: true,
  }
);

const Message = model<IMessage, MessageModel>('Message', schema);

export default Message;