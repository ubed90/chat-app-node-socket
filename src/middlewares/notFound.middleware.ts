import { Response } from "express";

const notFoundMiddleware = (_: any, res: Response) => {
    return res.status(404).json('URL Does not Exist');
}

export default notFoundMiddleware;