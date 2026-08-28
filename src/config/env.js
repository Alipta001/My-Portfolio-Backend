const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_portfolio',
  sessionSecret: process.env.SESSION_SECRET || 'change-this-session-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  ownerEmail: process.env.EMAIL_USER || '',
  smtp: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },
};
