const multer = require('multer');
const { UPLOADS_DIR } = require('./constants');

module.exports = multer({ dest: UPLOADS_DIR });