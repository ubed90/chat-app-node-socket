import { Request, Response } from "express";

const registerController = (req: Request, res: Response) => {
    return res.status(200).send("Register Controller");
}

const verifyEmailController = (req: Request, res: Response) => {
    return res.status(200).send("Verify Email Controller")
}

const loginController = (req: Request, res: Response) => {
    return res.status(200).send("Login Controller");
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