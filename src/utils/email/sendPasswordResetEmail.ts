import sendEmail, { Person } from './sendEmail';
import getTemplate from './template';

type PasswordReset = {
    name: string,
    email: string,
    token: string
}

const sendPasswordResetEmail = ({ email, name, token }: PasswordReset) => {
  const passwordResetURL = `${process.env.ORIGIN}/reset-password?token=${token}&email=${email}`;

  const subject = '📍 Password Reset - ChatsUP';

  const to: Person[] = [{ email, name }];

  const content = `
        <p>Your password reset request has been initiated.</p>
        <p>Click Below link to Reset your password</p>
        <a href="${passwordResetURL}" target="_blank" class="button alert">Reset Your Password</a>
        <span class="note alert">Note :- This link is valid for 20 minutes only.</span>
    `;

  const html = getTemplate({
    name,
    email,
    heading: 'Reset Your Account Password 🚀',
    content,
  });

  return sendEmail({
    subject,
    to,
    html,
  });
};

export default sendPasswordResetEmail;
