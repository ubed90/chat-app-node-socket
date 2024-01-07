import { NextFunction, Request, Response } from "express";


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("🚀 From Auth MIDDLEWARE");
    next();
}

export default authMiddleware;