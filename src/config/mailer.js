const { sendContactEmail } = require('../utils/mailer');

async function notifyOwner(message) {
  return sendContactEmail({
    name: message.name,
    email: message.email,
    message: message.message,
  });
}

module.exports = { notifyOwner, sendContactEmail };
