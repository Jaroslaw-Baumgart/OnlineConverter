const pdfPoppler = require('pdf-poppler');
const pdfParse = require('pdf-parse');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

module.exports = {
  convertPdfToImages: async (pdfPath, outputDir) => {
    return pdfPoppler.convert(pdfPath, {
      format: 'jpeg',
      out_dir: outputDir,
      out_prefix: 'page',
      page: null,
    });
  },
  
  extractTextFromPdf: async (pdfPath) => {
    const data = await pdfParse(await fs.readFile(pdfPath));
    return data.text;
  },
  
  convertPdfToTextWithPdftotext: async (pdfPath, outputPath) => {
    await execAsync(`pdftotext "${pdfPath}" "${outputPath}"`);
  }
};