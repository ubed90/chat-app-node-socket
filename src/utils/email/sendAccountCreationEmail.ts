import sendEmail, { Person } from './sendEmail';
import getTemplate from './template';

type AccountCreated = {
  name: string;
  email: string;
  usingProvider?: boolean;
  password?: string;
};

const changePasswordURL = `${process.env.ORIGIN}/chats/change-password`;

const sendAccountCreationEmail = ({
  email,
  name,
  usingProvider = false,
  password,
}: AccountCreated) => {
  const subject = 'Welcome to ChatsUP 📢';

  const to: Person[] = [{ email, name }];

  const content = `
        <p class="welcome-text">We are pleased to have you onboard. <br /><strong>Help us in making <span class="green">ChatsUP</span> the Whatsapp for the Web 🌎</strong></p>
        ${
          usingProvider && password
            ? `<p>Your generated password for the account is <span class="password">${password}</span></p><p>Please login and click below link to change your password</p><a href="${changePasswordURL}" target="_blank" class="button">Change Password</a>`
            : ''
        }
    `;

  const html = getTemplate({
    name,
    email,
    heading: 'Account Created Successfully 🚀',
    content,
  });

  return sendEmail({
    subject,
    to,
    html,
  });
};

export default sendAccountCreationEmail;
