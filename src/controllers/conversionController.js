const conversionService = require('../services/conversionService');

module.exports = {
  pdfToJpg: async (req, res) => {
    try {
      const result = await conversionService.convertPdfToJpg(req.file.path, req.file.filename);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('Error PDF → JPG:', err);
      res.status(500).send('Failed to convert PDF to JPG.');
    }
  },

  pdfToTxt: async (req, res) => {
    try {
      const result = await conversionService.convertPdfToTxt(req.file.path, req.file.filename);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: 'Failed to convert PDF to TXT.',
        details: err.message,
        solution: 'The file may be corrupted, encrypted, or require pdftotext to be installed.'
      });
    }
  },

  jpgToPng: async (req, res) => {
    try {
      const result = await conversionService.convertJpgToPng(req.file.path, req.file.filename);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to convert JPG to PNG.' 
      });
    }
  },

  pngToJpg: async (req, res) => {
    try {
      const result = await conversionService.convertPngToJpg(req.file.path, req.file.filename);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to convert PNG to JPG.' 
      });
    }
  },

  txtToPdf: async (req, res) => {
    try {
      const result = await conversionService.convertTxtToPdf(req.file.path, req.file.filename);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).send('Failed to convert TXT to PDF.');
    }
  },

  jpgToPdf: async (req, res) => {
    try {
      const result = await conversionService.convertJpgToPdf(req.file.path, req.file.filename);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: 'Failed to convert JPG to PDF.',
        details: err.message
      });
    }
  },

  docxToPdf: async (req, res) => {
    try {
      const result = await conversionService.convertDocxToPdf(req.file.path, req.file.filename);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).send('Failed to convert DOCX to PDF. Is LibreOffice installed?');
    }
  }
};