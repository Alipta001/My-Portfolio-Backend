const nodemailer = require('nodemailer');

const requiredSmtpEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'EMAIL_TO'];
const missingSmtpEnv = requiredSmtpEnv.filter((key) => !process.env[key]);

if (missingSmtpEnv.length > 0) {
  console.warn('SMTP config missing:', missingSmtpEnv.join(', '));
}

console.log('SMTP credentials present:', Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS));

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

async function sendViaBrevoApi({ name, email, message }) {
  if (!process.env.BREVO_API_KEY) {
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'Portfolio Contact', email: process.env.EMAIL_FROM },
        to: [{ email: process.env.EMAIL_TO, name: 'Portfolio Admin' }],
        replyTo: { email, name },
        subject: `Portfolio contact: ${name}`,
        html: `<p><strong>${name}</strong> &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br>')}</p>`,
        text: `${name} <${email}>\n\n${message}`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Brevo API email failed:', response.status, text);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Brevo API email fallback failed:', error.message || error);
    return false;
  }
}

async function notifyOwner(contact) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM || !process.env.EMAIL_TO) {
    console.warn('Missing required SMTP environment variables.');
    return false;
  }

  try {
    const info = await Promise.race([
      transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        replyTo: contact.email,
        subject: `Portfolio contact: ${contact.name}`,
        text: `${contact.name} <${contact.email}>\n\n${contact.message}`,
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Brevo SMTP send timed out after 10 seconds')), 10000);
      }),
    ]);

    return Boolean(info?.messageId);
  } catch (error) {
    console.error('📧 SMTP email failed, attempting Brevo HTTP fallback:', error.message || error);

    if (process.env.BREVO_API_KEY) {
      return sendViaBrevoApi({
        name: contact.name,
        email: contact.email,
        message: contact.message,
      });
    }

    return false;
  }
}

async function sendContactEmail(payload) {
  return notifyOwner(payload);
}

module.exports = {
  transporter,
  notifyOwner,
  sendContactEmail,
};
