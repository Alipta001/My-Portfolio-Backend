const nodemailer = require('nodemailer');

const requiredSmtpEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'EMAIL_TO'];
const missingSmtpEnv = requiredSmtpEnv.filter((key) => !process.env[key]);

if (missingSmtpEnv.length > 0) {
  console.warn('SMTP config missing:', missingSmtpEnv.join(', '));
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Brevo SMTP transporter error:', error.message || error);
    return;
  }

  console.log('✅ Brevo SMTP transporter is ready to send emails');
  console.log('SMTP verification success:', success);
});

async function sendContactEmail({ name, email, message }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM || !process.env.EMAIL_TO) {
    throw new Error('Missing required SMTP environment variables. Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, and EMAIL_TO.');
  }

  try {
    const info = await Promise.race([
      transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        replyTo: email,
        subject: `Portfolio contact: ${name}`,
        text: `${name} <${email}>\n\n${message}`,
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Brevo SMTP send timed out after 15 seconds')), 15000);
      }),
    ]);

    return {
      ok: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('📧 Email send failed:', error.message || error);
    throw error;
  }
}

module.exports = {
  transporter,
  sendContactEmail,
};
