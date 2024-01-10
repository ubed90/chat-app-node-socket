const nodemailerConfig = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: 'shaikhobaid123@gmail.com',
    pass: process.env.BREVO_API_KEY,
  },
};

export default nodemailerConfig;