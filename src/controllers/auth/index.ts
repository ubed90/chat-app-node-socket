import {
  BadRequestError,
  CustomApiError,
  NotFoundError,
  UnauthorizedError,
} from '@/errors';
import { User } from '@/models';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from '@/utils/email';
import { attachCookiesToResponse, createToken, hashString, isTokenValid } from '@/utils';
import { StatusCodes } from 'http-status-codes';

const registerController = async (req: Request, res: Response) => {
  const { name, email, password, profilePicture, username } = req.body;

  if (!name || !email || !password || !username)
    throw new BadRequestError('Please Provide All Fields');

  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    username,
    profilePicture,
    verificationToken,
  });

  const isEmailSent = await sendVerificationEmail(user);

  if (!isEmailSent) {
    // return res.status(501).json({
    //   status: 'error',
    //   message: 'Your account is created. But there is some issue with email provider'
    // })
    throw new CustomApiError(
      'Your account is created. But there is some issue with email provider',
      500
    );
  }

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message:
      'Your account is created successfully. Please check your email for verification 🚀',
  });
};

const verifyEmailController = async (req: Request, res: Response) => {
  const { verificationToken, email } = req.query;

  if (!verificationToken || !email) throw new BadRequestError();

  const user = await User.findOne({ email });

  if (!user) throw new NotFoundError(`No user found with email: ${email}`);

  if (user.isVerified)
    return res
      .status(200)
      .json({ status: 'success', message: 'User Already Verified' });

  if (user.verificationToken !== verificationToken)
    throw new UnauthorizedError('Invalid verification token');

  user.isVerified = true;
  user.verifiedOn = new Date();
  user.verificationToken = undefined;

  await user.save();

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: `Congrats ${user.email} is now verified.`,
  });
};

const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new BadRequestError('Email and password is requried');

  const user = await User.findOne({ email });

  if (!user) throw new NotFoundError(`No user found with email: ${email}`);

  if (!user.isVerified) throw new BadRequestError('Please verify email first');

  const isValidCredential = await user.comparePassword(password);

  if (!isValidCredential)
    throw new UnauthorizedError('Invalid credentials. Try again later');

  const existingToken = user.tokens?.find(token => token.ip === req.clientIp && token.userAgent === req.headers['user-agent']);
  let refreshToken;

  try {
    if (existingToken && isTokenValid({ token: existingToken.refreshToken })) {
      refreshToken = existingToken.refreshToken;
    } else {
      refreshToken = createToken({
        payload: user.toJSON(),
        isAccessToken: false,
      });

      const token = {
        ip: req.clientIp,
        userAgent: req.headers['user-agent'],
        refreshToken,
      };

      user.tokens?.push(token);
    }
  } catch (error) {
    refreshToken = createToken({
      payload: user.toJSON(),
      isAccessToken: false,
    });

    const token = {
      ip: req.clientIp,
      userAgent: req.headers['user-agent'],
      refreshToken
    };

    user.tokens = user.tokens?.filter(token => token.refreshToken === existingToken?.refreshToken);
    user.tokens?.push(token);
  }

  await user.save();

  attachCookiesToResponse({ res, user: user.toJSON(), refreshToken });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    user: {
      ...user.toJSON(),
      profilePicture: user.profilePicture,
    },
  });
};

const logoutController = async (req: Request, res: Response) => {
  const { refreshToken } = req.signedCookies;

  console.log(res.locals);

  const user = await User.findOne({ _id: res.locals.user._id });

  if (!user) throw new UnauthorizedError();

  user.tokens = user?.tokens?.filter(
    (token) => token.refreshToken !== refreshToken
  );

  await user.save();

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    signed: true,
    sameSite: process.env.NODE_ENV === 'development' ? true : 'none',
    secure: process.env.NODE_ENV === 'development' ? false : true, 
    expires: new Date(Date.now()),
  });

  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    signed: true,
    sameSite: process.env.NODE_ENV === 'development' ? true : 'none',
    secure: process.env.NODE_ENV === 'development' ? false : true, 
    expires: new Date(Date.now()),
  });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'User logged out successfully.',
  });
};

const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) throw new BadRequestError('Email Must be Provided');

  const user = await User.findOne({ email });

  if (!user) throw new BadRequestError(`No user with email: ${email}`);

  const passwordToken = crypto.randomBytes(70).toString('hex');
  const passwordTokenExpirationDate = new Date(Date.now() + 1000 * 60 * 20); // * 20 Minute Expiry

  await sendPasswordResetEmail({
    email,
    name: user.name,
    token: passwordToken,
  });
  
  user.passwordToken = hashString(passwordToken);
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;
  
  await user.save();

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Please check your email to reset your password.',
  });
};

const resetPasswordController = async (req: Request, res: Response) => {
  const { password, token, email } = req.body;

  if (!email || !token || !password)
    throw new BadRequestError('Please provide all values.');

  const user = await User.findOne({ email });

  // * We will send 200 with the email, if user is not available in DB - Coz we dont need to expose attackers if an email exists in our DB
  if (user) {
    
    if (user.passwordToken === hashString(token)) {
      const currentDate = new Date();
      if(user.passwordTokenExpirationDate && !(user.passwordTokenExpirationDate > currentDate)) {
        user.passwordToken = undefined;
        user.passwordTokenExpirationDate = undefined;
        await user.save();
        throw new BadRequestError('Link Expired. Please Try resetting again.');
      }

      const isMatch = await user.comparePassword(password);

      if(isMatch) throw new BadRequestError('Old and New password cannot be same.');

      user.password = password;
      user.passwordToken = undefined;
      user.passwordTokenExpirationDate = undefined;

      await user.save();

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Password reset successfully.'
      })
    }

    throw new BadRequestError('Invalid reset link. Try again later.');
  }

  return res.status(StatusCodes.NOT_FOUND).json({ 
    status: 'error',
    message: 'No user with email: ' + email
  });
};

const updateProfileController = async (req: Request, res: Response) => {
  const { name, email, username } = req.body;

  const { id: _id } = req.params;

  if(!_id || !name || !email || !username) throw new BadRequestError('Please Provide All Fields');

  const user = await User.findOne({ _id: res.locals.user._id });

  if(!user || _id !== res.locals.user._id) throw new UnauthorizedError('Not authorized to update user profile');

  user.name = name || user.name;
  user.email = email || user.email;
  user.username = username || user.username;

  await user.save();

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Profile Updated Successfully 🚀'
  })
}

export {
  registerController,
  verifyEmailController,
  loginController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  updateProfileController,
};
