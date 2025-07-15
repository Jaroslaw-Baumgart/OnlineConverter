const cleanupService = require('../services/cleanupService');
const { CLEANUP_INTERVAL } = require('../config/constants');

module.exports = {
  startCleanupInterval: () => {
    setInterval(() => cleanupService.cleanupOldFiles(), CLEANUP_INTERVAL);
    console.log('Cleanup interval started');
  }
};