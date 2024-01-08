import { Schema } from 'mongoose';

export interface IToken {
  _id?: string;
  refreshToken: string;
  ip?: string;
  userAgent?: string;
  user: string | Schema.Types.ObjectId;
}

const schema = new Schema<IToken>({
  refreshToken: String,
  ip: {
    type: String,
    unique: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  userAgent: {
    type: String,
    unique: true,
  },
});

export default schema