const app = require('./app');
const connectDatabase = require('./config/db');
const { port } = require('./config/env');

const server = app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});

connectDatabase().catch(error => {
  console.error(`MongoDB connection failed: ${error.message}`);
  console.error('The backend is running, but database-backed routes require a valid MONGODB_URI in backend/.env.');
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
