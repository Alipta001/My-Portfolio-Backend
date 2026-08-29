const nodemailer = require('nodemailer');

const smtpPort = Number(process.env.EMAIL_PORT || 587);
const smtp = {
  host: process.env.EMAIL_HOST,
  port: smtpPort,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
};
const ownerEmail = process.env.EMAIL_USER || '';

const transporter = smtp.host && smtp.user && smtp.pass
  ? nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.port === 465, auth: { user: smtp.user, pass: smtp.pass } })
  : null;

async function notifyOwner(message) {
  if (!transporter || !ownerEmail) return false;
  await transporter.sendMail({
    from: smtp.from,
    to: ownerEmail,
    replyTo: message.email,
    subject: `Portfolio contact: ${message.name}`,
    text: `${message.name} <${message.email}>\n\n${message.message}`,
  });
  return true;
}

module.exports = { notifyOwner };
