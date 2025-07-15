const fs = require('fs/promises');
const path = require('path');
const { UPLOADS_DIR, OUTPUT_DIR, FILE_TTL } = require('../config/constants');

module.exports = {
  async cleanupOldFiles() {
    const dirs = [OUTPUT_DIR, UPLOADS_DIR];
    const now = Date.now();

    for (const dir of dirs) {
      try {
        const items = await fs.readdir(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          try {
            const stats = await fs.stat(fullPath);
            if (now - stats.mtimeMs > FILE_TTL) {
              await fs.rm(fullPath, { recursive: true, force: true });
            }
          } catch {}
        }
      } catch {}
    }
  }
};