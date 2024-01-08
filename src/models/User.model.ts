import { Model, Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import Token, { IToken } from './Token.model';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  profilePicture?: string;
  password: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  verifiedOn?: Date;
  verificationToken?: string;
  passwordToken?: string;
  passwordTokenExpirationDate?: Date;
  tokens?: IToken[]
}

export interface TokenizeUserData {
  _id: string;
  name: string;
  email: string;
}

interface IUserMethods {
  comparePassword(passwordToCompare: string): Promise<boolean>;
  toJSON(): TokenizeUserData;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const schema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Please Provide Name.'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Please Provide email.'],
      unique: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: (props) => `${props.value} is not a valid email.`,
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, 'Please Provide Password.'],
      minlength: 8,
      trim: true,
      validate: {
        validator: function (value: string) {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minSymbols: 1,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
          });
        },
        message: (props) =>
          `${props.value} is weak. Password must contain at least 1 Lower, 1 Upper, 1 Number and 1 Symbol and should be minimum of 8 Characters`,
      },
    },
    passwordToken: String,
    passwordTokenExpirationDate: Date,
    profilePicture: String,
    verificationToken: String,
    verifiedOn: Date,
    tokens: [Token]
  },
  {
    timestamps: true,
  }
);

// * Instance Methods
schema.methods.comparePassword = function (passwordToCompare) {
  return bcrypt.compare(passwordToCompare, this.password);
};

schema.methods.toJSON = function () {
  const tokenizedData: TokenizeUserData = {
    _id: this._id,
    name: this.name,
    email: this.email
  }

  return tokenizedData;
}

// ? HOOKS
schema.pre('save', async function() {
  if(!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

const User = model<IUser, UserModel>('User', schema);

export default User;
