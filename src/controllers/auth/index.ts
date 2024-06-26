import {
  BadRequestError,
  CustomApiError,
  NotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
} from '@errors';
import { User } from '@models';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from '@utils/email';
import {
  attachCookiesToResponse,
  createToken,
  hashString,
  isTokenValid,
} from '@utils';
import { StatusCodes } from 'http-status-codes';
import { UploadedFile } from 'express-fileupload';
import ImageService from '@utils/cloudinary';
import { IProfilePicture } from '@models/ProfilePicture.model';
import generatePassword from '@utils/generateRandomPassword';
import {sendAccountCreationEmail} from '@utils/email';

const registerController = async (req: Request, res: Response) => {
  let { name, email, password, profilePicture, username, usingProvider } =
    req.body;

  if(usingProvider && (!name || !email)) throw new BadRequestError('Name and Email are required');

  if (!usingProvider && (!name || !email || !password || !username))
    throw new BadRequestError('Please Provide All Fields');

  if (!usingProvider) {
    const verificationToken = crypto.randomBytes(40).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      username,
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
  } else {
    const username = (email as string).split('@')[0].substring(0, 15);
    const password = generatePassword();
    if (profilePicture) {
      profilePicture = {
        public_id: username,
        url: profilePicture,
      };
    }

    const user = await User.create({
      name,
      email,
      username,
      password,
      profilePicture,
      isVerified: true
    });

    await sendAccountCreationEmail({
      name: user.name,
      email: user.email,
      usingProvider: true,
      password,
    });

    const refreshToken = createToken({
      payload: user.toJSON(),
      isAccessToken: false,
    });

    const token = {
      ip: req.clientIp,
      userAgent: req.headers['user-agent'],
      refreshToken,
    };

    user.tokens?.push(token);

    await user.save();

    attachCookiesToResponse({ res, user: user.toJSON(), refreshToken });

    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Account Created Successfully.',
      user: {
        ...user.toJSON(),
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture?.url,
      },
    });
  }

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message:
      'Your account is created successfully. Please check your email for verification 🚀',
  });
};

const verifyEmailController = async (req: Request, res: Response) => {
  const { token, email } = req.query;

  if (!token || !email) throw new BadRequestError();

  const user = await User.findOne({ email });

  if (!user) throw new NotFoundError(`No user found with email: ${email}`);

  if (user.isVerified)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ status: 'success', message: 'User Already Verified' });

  if (user.verificationToken !== token)
    throw new UnauthorizedError('Invalid verification token');

  user.isVerified = true;
  user.verifiedOn = new Date();
  user.verificationToken = undefined;

  await user.save();

  try {
    await sendAccountCreationEmail(user);
  } catch (error) {
    console.log(error);
  }

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

  const existingToken = user.tokens?.find(
    (token) =>
      token.ip === req.clientIp && token.userAgent === req.headers['user-agent']
  );
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
      refreshToken,
    };

    user.tokens = user.tokens?.filter(
      (token) => token.refreshToken === existingToken?.refreshToken
    );
    user.tokens?.push(token);
  }

  await user.save();

  attachCookiesToResponse({ res, user: user.toJSON(), refreshToken });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    user: {
      ...user.toJSON(),
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture?.url,
    },
  });
};

const autoLoginController = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) throw new BadRequestError('Email is requried');

  const user = await User.findOne({ email });

  if (!user) throw new NotFoundError(`No user found with email: ${email}`);

  if (!user.isVerified) throw new BadRequestError('Please verify email first');

  const existingToken = user.tokens?.find(
    (token) =>
      token.ip === req.clientIp && token.userAgent === req.headers['user-agent']
  );
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
      refreshToken,
    };

    user.tokens = user.tokens?.filter(
      (token) => token.refreshToken === existingToken?.refreshToken
    );
    user.tokens?.push(token);
  }

  await user.save();

  attachCookiesToResponse({ res, user: user.toJSON(), refreshToken });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Login Successful 🚀.',
    user: {
      ...user.toJSON(),
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture?.url,
    },
  });
};

const logoutController = async (req: Request, res: Response) => {
  const { refreshToken } = req.signedCookies;

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
      if (
        user.passwordTokenExpirationDate &&
        !(user.passwordTokenExpirationDate > currentDate)
      ) {
        user.passwordToken = undefined;
        user.passwordTokenExpirationDate = undefined;
        await user.save();
        throw new BadRequestError('Link Expired. Please Try resetting again.');
      }

      const isMatch = await user.comparePassword(password);

      if (isMatch)
        throw new BadRequestError('Old and New password cannot be same.');

      user.password = password;
      user.passwordToken = undefined;
      user.passwordTokenExpirationDate = undefined;

      await user.save();

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Password reset successfully.',
      });
    }

    throw new BadRequestError('Invalid reset link. Try again later.');
  }

  return res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: 'No user with email: ' + email,
  });
};

const changePasswordController = async (req: Request, res: Response) => {
  const { password, newPassword } = req.body;

  if(!password || !newPassword) throw new BadRequestError('Both Old and New password is required');

  if(password ===  newPassword) throw new BadRequestError('Both Old and New password cannot be same');

  const user = await User.findOne({ _id: res.locals.user._id });

  if(!user) throw new UnauthenticatedError('Session Expired. Please login again.')

  const isValidCredential = await user.comparePassword(password);

  if(!isValidCredential) throw new BadRequestError('Invalid old password. Please try again');

  user.password = newPassword;

  await user.save();

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Password changed successfully',
  })
}

const updateProfileController = async (req: Request, res: Response) => {
  const { name, email, username, phoneNumber } = req.body;

  const { id: _id } = req.params;

  if (!_id || !name || !email || !username)
    throw new BadRequestError('Please Provide All Fields');

  const user = await User.findOne({ _id: res.locals.user._id });

  if (!user || _id !== res.locals.user._id)
    throw new UnauthorizedError('Not authorized to update user profile');

  let profilePicture: IProfilePicture | undefined = undefined;

  if (req?.files) {
    const { secure_url, public_id } = await ImageService.uploadImage({
      file: req.files.profilePicture as UploadedFile,
      upload_folder: user.email,
    });

    profilePicture = { public_id, url: secure_url };
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.username = username || user.username;
  user.phoneNumber = phoneNumber || user?.phoneNumber;

  if (profilePicture) {
    if (user?.profilePicture) {
      // ! Delete Previous Image Logic
      await ImageService.deleteImage(user);
    }
    user.profilePicture = profilePicture;
  }

  await user.save();

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Profile Updated Successfully 🚀',
    user: {
      ...user.toJSON(),
      profilePicture: user?.profilePicture?.url,
      phoneNumber: user?.phoneNumber,
    },
  });
};

const updateProfilePictureController = async (req: Request, res: Response) => {
  const profilePicture = req.files?.profilePicture;

  if(!profilePicture) throw new BadRequestError('Please provide an image to upload');

  const user = await User.findById(res.locals.user._id);

  if(!user) throw new UnauthorizedError('Not allowed to update profile.')

  const { secure_url, public_id } = await ImageService.uploadImage({
    file: profilePicture as UploadedFile,
    upload_folder: res.locals.user.email,
  });

  if (user?.profilePicture) {
    // ! Delete Previous Image Logic
    await ImageService.deleteImage(user);
  }
  user.profilePicture = { public_id, url: secure_url };

  await user.save();

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Profile Updated Successfully 🚀',
    user: {
      ...user.toJSON(),
      profilePicture: user?.profilePicture?.url,
      phoneNumber: user?.phoneNumber,
    },
  });
}

const removeProfilePictureController = async (req: Request, res: Response) => {
  const { id: _id } = req.params;

  if (!_id) throw new BadRequestError();

  const user = await User.findOne({ _id: res.locals.user._id });

  if (!user || _id !== res.locals.user._id)
    throw new UnauthorizedError('Not authorized to update user profile');

  await ImageService.deleteImage(user);

  user.profilePicture = undefined;

  await user.save();

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Profile picture deleted successfully.',
    user: {
      ...user.toJSON(),
      phoneNumber: user?.phoneNumber,
    },
  });
};

export {
  registerController,
  verifyEmailController,
  loginController,
  autoLoginController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  updateProfileController,
  removeProfilePictureController,
  updateProfilePictureController,
  changePasswordController
};
