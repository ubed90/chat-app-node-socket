import nodemailer from 'nodemailer';
import nodemailerConfig from './config';

// Admin Sender
export type Person = {
    email: string,
    name: string
}

const adminSender: Person = {
  email: process.env.ADMIN_EMAIL!,
  name: process.env.ADMIN_NAME!,
};

type Email = {
    sender?: Person,
    to: Person[],
    subject: string,
    html: string,
    replyTo?: Person
}

const sendEmail = async ({ subject, html, to, replyTo = adminSender, sender = adminSender }: Email) => {
    try {
        const transporter = nodemailer.createTransport(nodemailerConfig);

        await transporter.sendMail({
            from: `${sender.name} - ${sender.email}`,
            to: to.map(receipent => receipent.email),
            subject,
            html,
            ...(replyTo && { replyTo: `${replyTo.name} - ${replyTo.email}` })
        })

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export default sendEmail;