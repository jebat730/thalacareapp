const crypto = require('crypto');

// Generate a secure random string of 32 characters
const randomString = crypto.randomBytes(32).toString('hex');

console.log('Generated JWT_SECRET:', randomString);
