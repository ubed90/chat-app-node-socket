import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import cookieParser from 'cookie-parser';
import cookie from "cookie";
import {
  NotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
} from '@/errors';
import { User } from '@/models';
import { JwtPayload } from 'jsonwebtoken';
import { isTokenValid } from '@/utils';

type SocketNextFunction = (err?: ExtendedError | undefined) => void;

const authorizeSocketMiddleware = async (
  socket: Socket,
  next: SocketNextFunction
) => {
  try {
    // console.log("HELLO FROM SOCKET MIDDLEWARE", socket.handshake.headers.cookie);
    const parsedCookies = cookie.parse(socket.handshake.headers.cookie || '');

    const cookies = cookieParser.signedCookies(
      parsedCookies,
      process.env.JWT_SECRET as string
    );

    // console.log(cookies);

    let token = cookies?.accessToken;

    if (!token) {
      token = socket.handshake.auth?.token;
    }

    // console.log(token);

    if (!token)
      throw new UnauthorizedError('Un-authorized handshake. Token is missing');

    const decodedToken = isTokenValid({ token }) as JwtPayload;

    const user = await User.findById(decodedToken._id).select(
      'name email username'
    );

    if (!user)
      throw new NotFoundError('User Not Found with Id: ' + decodedToken._id);

    socket.data.user = user;

    next();
  } catch (error) {
    console.log('FROM SOCKET MW :: ', error);
    // * Error Establishing Connection Event
    next(new UnauthenticatedError('Session exipred. Please login again'));
  }
};

export default authorizeSocketMiddleware;