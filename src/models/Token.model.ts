import { Schema } from 'mongoose';

export interface IToken {
  _id?: string;
  refreshToken: string;
  ip?: string;
  userAgent?: string;
}

const schema = new Schema<IToken>({
  refreshToken: String,
  ip: {
    type: String,
    unique: true,
  },
  userAgent: {
    type: String,
    unique: true,
  },
});

export default schema