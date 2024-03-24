import { IUser } from '@models/User.model';
import { Response } from 'express';
import JWT from 'jsonwebtoken';

const createToken = ({ payload, isAccessToken }: { payload: any, isAccessToken: boolean }) => {
    const expiresIn = isAccessToken
      ? process.env.ACCESS_TOKEN_EXPIRY
      : process.env.REFRESH_TOKEN_EXPIRY;
    return JWT.sign(payload, process.env.JWT_SECRET!, { expiresIn })
}


const isTokenValid = ({ token }:{ token: string }) => JWT.verify(token, process.env.JWT_SECRET!)

const attachCookiesToResponse = ({ res, user, refreshToken }: { res: Response, user: IUser, refreshToken: string }) => {
    const accessToken = createToken({ payload: user, isAccessToken: true })
    
    const oneDay = 1000 * 60 * 60 * 24;
    const longerExpiry = 1000 * 60 * 60 * 24 * 15;

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        signed: true,
        sameSite: process.env.NODE_ENV === 'development' ? true : 'none',
        secure: process.env.NODE_ENV === 'development' ? false : true,
        expires: new Date(Date.now() + oneDay)
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        signed: true,
        sameSite: process.env.NODE_ENV === 'development' ? true : 'none',
        secure: process.env.NODE_ENV === 'development' ? false : true,
        expires: new Date(Date.now() + longerExpiry)
    });
}

export { createToken, isTokenValid, attachCookiesToResponse };