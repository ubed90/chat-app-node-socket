import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err: any, _: Request, res: Response, __: NextFunction) => {
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || 'Something went wrong. Please try again later.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }

    if(err.name === 'ValidationError') {
        customError.message = Object.values(err.errors).map((item: any) => item.message).join(', ');
        customError.statusCode = 400;
    }

    if(err.code && err.code === 11000) {
        customError.message = `Duplicate value entered for ${Object.keys(
          err.keyValue
        )} field, please choose another value`;
        customError.statusCode = 400;
    }

    if(err.name === 'CastError') {
        customError.message = `No item found with id : ${err.value}`;
        customError.statusCode = 404;
    }


    return res.status(customError.statusCode).json(customError);
}

export default errorHandlerMiddleware;