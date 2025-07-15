const path = require('path');

module.exports = {
  UPLOADS_DIR: path.join(__dirname, '../../uploads'),
  OUTPUT_DIR: path.join(__dirname, '../../output'),
  CLEANUP_INTERVAL: 5 * 60 * 1000,
  FILE_TTL: 10 * 60 * 1000,
  PORT: 3000
};