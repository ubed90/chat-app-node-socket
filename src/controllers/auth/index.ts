import { BadRequestError, CustomApiError, NotFoundError, UnauthorizedError } from "@/errors";
import { User } from "@/models";
import { Request, Response } from "express";
import crypto from 'crypto';
import sendVerificationEmail from "@/utils/email/sendVerificationEmail";
import { IToken } from "@/models/Token.model";
import { attachCookiesToResponse, createToken } from "@/utils";

const registerController = async (req: Request, res: Response) => {
    const { name, email, password, profilePicture } = req.body;

    if(!name || !email || !password) throw new BadRequestError('Please Provide All Fields');

    const verificationToken = crypto.randomBytes(40).toString('hex');

    const user = await User.create({ name, email, password, profilePicture, verificationToken });

    const isEmailSent = await sendVerificationEmail(user);

    if(!isEmailSent) {
      // return res.status(501).json({
      //   status: 'error',
      //   message: 'Your account is created. But there is some issue with email provider'
      // })
      throw new CustomApiError(
        'Your account is created. But there is some issue with email provider', 500);
    }
    
    return res.status(201).json({
      status: 'success',
      message:
        'Your account is created successfully. Please check your email for verification 🚀',
    });
}

const verifyEmailController = async (req: Request, res: Response) => {
  const { verificationToken, email } = req.query;

  if(!verificationToken || !email) throw new BadRequestError();

  const user = await User.findOne({ email });

  if (!user) throw new NotFoundError(`No user found with email: ${email}`);

  if(user.isVerified) return res.status(200).json({ status: 'success', message: 'User Already Verified' });

  if(user.verificationToken !== verificationToken) throw new UnauthorizedError('Invalid verification token');

  user.isVerified = true;
  user.verifiedOn = new Date();
  user.verificationToken = undefined;

  await user.save();

  return res.status(200).json({
    status: 'success',
    message: `Congrats ${user.email} is now verified.`
  })
}

const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new BadRequestError('Email and password is requried');

  const user = await User.findOne({ email });

  if (!user) throw new NotFoundError(`No user found with email: ${email}`);

  if(!user.isVerified) throw new BadRequestError('Please verify email first')

  const isValidCredential = await user.comparePassword(password);

  if (!isValidCredential)
    throw new UnauthorizedError('Invalid credentials. Try again later');

  const refreshToken = createToken({ payload: user.toJSON(), isAccessToken: false });

  const token: IToken = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    refreshToken,
    user: user._id
  }

  user.tokens?.push(token);

  await user.save();

  attachCookiesToResponse({ res, user: user.toJSON(), refreshToken });

  return res.status(200).json({
    status: 'success',
    user: {
      ...user.toJSON(),
      profilePicture: user.profilePicture
    }
  })
}

const logoutController = (req: Request, res: Response) => {
    return res.status(200).send('Logout Controller');
}

const forgotPasswordController = (req: Request, res: Response) => {
  return res.status(200).send('Forgot Password Controller');
};

const resetPasswordController = (req: Request, res: Response) => {
  return res.status(200).send('Reset Password Controller');
};

export { registerController, verifyEmailController, loginController, logoutController, forgotPasswordController, resetPasswordController }