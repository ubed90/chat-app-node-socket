import { Schema } from 'mongoose';

export interface IToken {
  _id?: string;
  refreshToken: string;
  ip?: string;
  userAgent?: string;
}

const schema = new Schema<IToken>({
  refreshToken: String,
  ip: String,
  userAgent: String,
});

export default schema