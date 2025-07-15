const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/apiRoutes');
const mainRoutes = require('./routes/mainRoutes');
const { PORT, OUTPUT_DIR } = require('./config/constants');
const cleanupController = require('./controllers/cleanupController');

const app = express();

app.use(express.static(path.join(__dirname, '../')));
app.use('/output', express.static(OUTPUT_DIR));

app.use('/', mainRoutes);
app.use('/convert', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
  cleanupController.startCleanupInterval();
});