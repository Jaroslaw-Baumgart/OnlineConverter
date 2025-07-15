const express = require('express');
const router = express.Router();
const conversionController = require('../controllers/conversionController');
const upload = require('../config/multer-config');
const fileValidation = require('../middlewares/fileValidation');

router.post('/pdf-to-jpg', upload.single('pdf'), fileValidation.validatePdf, conversionController.pdfToJpg);
router.post('/pdf-to-txt', upload.single('pdf'), fileValidation.validatePdf, conversionController.pdfToTxt);
router.post('/jpg-to-png', upload.single('image'), fileValidation.validateImage, conversionController.jpgToPng);
router.post('/png-to-jpg', upload.single('image'), fileValidation.validateImage, conversionController.pngToJpg);
router.post('/txt-to-pdf', upload.single('text'), fileValidation.validateText, conversionController.txtToPdf);
router.post('/jpg-to-pdf', upload.single('image'), fileValidation.validateImage, conversionController.jpgToPdf);
router.post('/docx-to-pdf', upload.single('docx'), fileValidation.validateDocx, conversionController.docxToPdf);

module.exports = router;