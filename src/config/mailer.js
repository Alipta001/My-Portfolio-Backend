const nodemailer = require('nodemailer');
const { ownerEmail, smtp } = require('./env');

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
