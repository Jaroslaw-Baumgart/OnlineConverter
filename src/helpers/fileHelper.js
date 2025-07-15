const fs = require('fs/promises');

module.exports = {
  safeUnlink: (filePath) => {
    setTimeout(() => fs.unlink(filePath).catch(() => {}), 300);
  },
  
  createDirectory: async (dirPath) => {
    await fs.mkdir(dirPath, { recursive: true });
  },
  
  readDirectory: async (dirPath) => {
    return await fs.readdir(dirPath);
  }
};