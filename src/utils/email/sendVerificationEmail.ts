import { IUser } from "@models/User.model";
import sendEmail, { Person } from "./sendEmail";
import getTemplate from "./template";

const sendVerificationEmail = (user: IUser) => {
    const verifyEmailURL = `${process.env.ORIGIN}/verify-email?token=${user.verificationToken}&email=${user.email}`;

    const subject = 'Verification Required 🚫'

    const to: Person[] = [{ email: user.email, name: user.name }];

    const content = `
        <p>Thank you for choosing ChatsUP. Your account is just one click away.</p>
        <p>Click Below link to Verify Your Account</p>
        <a href="${verifyEmailURL}" target="_blank" class="button">Verify Account</a>
    `;

    const html = getTemplate({
      name: user.name,
      email: user.email,
      heading: 'Please Verify Your ChatsUP Account 🚀',
      content
    });

    return sendEmail({
        subject,
        to,
        html
    })
}

export default sendVerificationEmail;