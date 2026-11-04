const cloudinary = require('cloudinary').v2;

function checkConfigured() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
     process.env.CLOUDINARY_API_KEY &&
     process.env.CLOUDINARY_API_SECRET)
  );
}

function getCloudinary() {
  if (checkConfigured()) {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config();
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
  }
  return cloudinary;
}

/**
 * Uploads a local file path or buffer to Cloudinary.
 * Returns the Cloudinary upload result object with .secure_url, or null if not configured.
 */
async function uploadToCloudinary(filePathOrBuffer, options = {}) {
  if (!checkConfigured()) {
    return null;
  }

  const client = getCloudinary();
  const defaultOptions = {
    folder: 'portfolio',
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
    ...options,
  };

  if (Buffer.isBuffer(filePathOrBuffer)) {
    return new Promise((resolve, reject) => {
      const stream = client.uploader.upload_stream(defaultOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      stream.end(filePathOrBuffer);
    });
  }

  return await client.uploader.upload(filePathOrBuffer, defaultOptions);
}

module.exports = {
  cloudinary,
  checkConfigured,
  uploadToCloudinary,
};
