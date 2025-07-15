const sharp = require('sharp');

module.exports = {
  convertToPng: async (inputPath, outputPath) => {
    await sharp(inputPath).png().toFile(outputPath);
  },
  
  convertToJpg: async (inputPath, outputPath) => {
    await sharp(inputPath).jpeg().toFile(outputPath);
  },
  
  resizeImage: async (imageBuffer, options) => {
    return sharp(imageBuffer).resize(options).toBuffer();
  }
};