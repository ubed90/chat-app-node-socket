import { UnauthenticatedError } from "@/errors";
import { User } from "@/models";
import { attachCookiesToResponse, isTokenValid } from "@/utils";
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";


const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = req.signedCookies;

    if(!accessToken && !refreshToken) throw new UnauthenticatedError('Session Expired. Please login again');

    let user;

    try {
        if(accessToken) {
            const payload = isTokenValid({ token: accessToken });
            res.locals.user = payload;
            return next();
        }

        const payload = isTokenValid({ token: refreshToken }) as JwtPayload;
        
        console.log(payload);
        
        user = await User.findOne({ _id: payload._id, 'tokens.refreshToken': refreshToken });

        console.log(user);
        
        if (!user)
          throw new UnauthenticatedError('Session Expired. Please login again');

        attachCookiesToResponse({ res, user: user.toJSON(), refreshToken });
        res.locals.user = payload;
        return next();
    } catch (error) {
        console.log(error);
        if(refreshToken && user) {
            user.tokens = user.tokens?.filter(token => token.refreshToken !== refreshToken);
            await user.save();
        }
        throw new UnauthenticatedError('Session Expired. Please login again');
    }
}

export default authMiddleware;