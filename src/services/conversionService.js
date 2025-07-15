const pdfHelper = require('../helpers/pdfHelper');
const imageHelper = require('../helpers/imageHelper');
const fileHelper = require('../helpers/fileHelper');
const { OUTPUT_DIR } = require('../config/constants');
const PDFDocument = require('pdfkit');
const fs = require('fs/promises');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');

module.exports = {
  async convertPdfToJpg(pdfPath, filename) {
    const outputSubdir = path.join(OUTPUT_DIR, filename);
    await fileHelper.createDirectory(outputSubdir);
    
    await pdfHelper.convertPdfToImages(pdfPath, outputSubdir);
    fileHelper.safeUnlink(pdfPath);
    
    const jpgFiles = (await fileHelper.readDirectory(outputSubdir)).filter(f => f.endsWith('.jpg'));
    
    return {
      title: 'Conversion: PDF → JPG',
      fileType: 'jpg',
      folder: filename,
      files: jpgFiles.map(name => ({
        url: `/output/${filename}/${name}`,
        name
      }))
    };
  },

  async convertPdfToTxt(pdfPath, filename) {
    const outputName = `${filename}.txt`;
    const outputPath = path.join(OUTPUT_DIR, outputName);
    
    try {
      const text = await pdfHelper.extractTextFromPdf(pdfPath);
      await fs.writeFile(outputPath, text);
    } catch {
      await pdfHelper.convertPdfToTextWithPdftotext(pdfPath, outputPath);
    }
    
    fileHelper.safeUnlink(pdfPath);
    
    return {
      title: 'Conversion: PDF → TXT',
      fileType: 'txt',
      files: [{
        url: `/output/${outputName}`,
        name: outputName
      }]
    };
  },

  async convertJpgToPng(jpgPath, filename) {
    const outputName = `${filename}.png`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await imageHelper.convertToPng(jpgPath, outputPath);
    fileHelper.safeUnlink(jpgPath);

    return {
      title: 'Conversion: JPG → PNG',
      fileType: 'png',
      files: [{
        url: `/output/${outputName}`,
        name: outputName
      }]
    };
  },

  async convertPngToJpg(pngPath, filename) {
    const outputName = `${filename}.jpg`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await imageHelper.convertToJpg(pngPath, outputPath);
    fileHelper.safeUnlink(pngPath);

    return {
      title: 'Conversion: PNG → JPG',
      fileType: 'jpg',
      files: [{
        url: `/output/${outputName}`,
        name: outputName
      }]
    };
  },

  async convertTxtToPdf(txtPath, filename) {
    const outputName = `${filename}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    const text = await fs.readFile(txtPath, 'utf8');
    const doc = new PDFDocument();
    const stream = doc.pipe(require('fs').createWriteStream(outputPath));
    doc.fontSize(12).text(text, { align: 'left' });
    doc.end();

    fileHelper.safeUnlink(txtPath);

    return {
      title: 'Conversion: TXT → PDF',
      fileType: 'pdf',
      filename: outputName
    };
  },

  async convertJpgToPdf(jpgPath, filename) {
    const outputName = `${filename}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    const doc = new PDFDocument();
    const stream = doc.pipe(require('fs').createWriteStream(outputPath));

    const imageBuffer = await fs.readFile(jpgPath);
    await imageHelper.resizeImage(imageBuffer, { fit: 'inside', width: 500 });

    doc.image(jpgPath, {
      fit: [500, 700],
      align: 'center',
      valign: 'center'
    });

    doc.end();
    fileHelper.safeUnlink(jpgPath);

    return {
      title: 'Conversion: JPG → PDF',
      fileType: 'pdf',
      filename: outputName
    };
  },

  async convertDocxToPdf(docxPath, filename) {
    const outputPath = path.join(OUTPUT_DIR, `${filename}.pdf`);

    await execAsync(`soffice --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${docxPath}"`);
    fileHelper.safeUnlink(docxPath);

    return {
      title: 'Conversion: DOCX → PDF',
      fileType: 'pdf',
      filename: `${filename}.pdf`
    };
  }
};