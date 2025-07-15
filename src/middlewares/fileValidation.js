const path = require('path');

module.exports = {
  validatePdf: (req, res, next) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    next();
  },
  
  validateImage: (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }
    next();
  },
  
  validateText: (req, res, next) => {
    if (!req.file || path.extname(req.file.originalname).toLowerCase() !== '.txt') {
      return res.status(400).send('No TXT file uploaded.');
    }
    next();
  },
  
  validateDocx: (req, res, next) => {
    if (!req.file || path.extname(req.file.originalname).toLowerCase() !== '.docx') {
      return res.status(400).send('No DOCX file uploaded.');
    }
    next();
  }
};