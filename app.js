const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const pdfPoppler = require('pdf-poppler');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'output');
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const FILE_TTL = 10 * 60 * 1000;

app.use(express.static(__dirname));
app.use('/output', express.static(OUTPUT_DIR));
const upload = multer({ dest: UPLOADS_DIR });

function safeUnlink(filePath) {
  setTimeout(() => fs.unlink(filePath).catch(() => {}), 300);
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// PDF → JPG
app.post('/convert/pdf-to-jpg', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).send('No PDF file uploaded.');

  const { path: pdfPath, filename } = req.file;
  const outputSubdir = path.join(OUTPUT_DIR, filename);
  await fs.mkdir(outputSubdir, { recursive: true });

  try {
    await pdfPoppler.convert(pdfPath, {
      format: 'jpeg',
      out_dir: outputSubdir,
      out_prefix: 'page',
      page: null,
    });

    safeUnlink(pdfPath);
    const jpgFiles = (await fs.readdir(outputSubdir)).filter(f => f.endsWith('.jpg'));

    res.json({
      success: true,
      title: 'Conversion: PDF → JPG',
      fileType: 'jpg',
      folder: filename,
      files: jpgFiles.map(name => ({
        url: `/output/${filename}/${name}`,
        name
      }))
    });
  } catch (err) {
    console.error('Error PDF → JPG:', err);
    res.status(500).send('Failed to convert PDF to JPG.');
  }
});

// PDF → TXT
app.post('/convert/pdf-to-txt', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No PDF file uploaded.' });

  const outputName = `${req.file.filename}.txt`;
  const outputPath = path.join(OUTPUT_DIR, outputName);

  try {
    try {
      const data = await pdfParse(await fs.readFile(req.file.path));
      await fs.writeFile(outputPath, data.text);
    } catch {
      await new Promise((resolve, reject) => {
        exec(`pdftotext "${req.file.path}" "${outputPath}"`, err => (err ? reject(err) : resolve()));
      });
    }

    res.json({
      success: true,
      title: 'Conversion: PDF → TXT',
      fileType: 'txt',
      files: [{
        url: `/output/${outputName}`,
        name: outputName
      }]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to convert PDF to TXT.',
      details: err.message,
      solution: 'The file may be corrupted, encrypted, or require pdftotext to be installed.'
    });
  } finally {
    safeUnlink(req.file.path);
  }
});

// JPG → PNG
app.post('/convert/jpg-to-png', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No JPG file uploaded.' });

  const outputName = `${req.file.filename}.png`;
  const outputPath = path.join(OUTPUT_DIR, outputName);

  try {
    await sharp(req.file.path).png().toFile(outputPath);
    res.json({
      success: true,
      title: 'Conversion: JPG → PNG',
      fileType: 'png',
      files: [{
        url: `/output/${outputName}`,
        name: outputName
      }]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to convert JPG to PNG.' });
  } finally {
    safeUnlink(req.file.path);
  }
});

// PNG → JPG
app.post('/convert/png-to-jpg', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No PNG file uploaded.' });

  const outputName = `${req.file.filename}.jpg`;
  const outputPath = path.join(OUTPUT_DIR, outputName);

  try {
    await sharp(req.file.path).jpeg().toFile(outputPath);
    res.json({
      success: true,
      title: 'Conversion: PNG → JPG',
      fileType: 'jpg',
      files: [{
        url: `/output/${outputName}`,
        name: outputName
      }]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to convert PNG to JPG.' });
  } finally {
    safeUnlink(req.file.path);
  }
});

// TXT → PDF
app.post('/convert/txt-to-pdf', upload.single('text'), async (req, res) => {
  if (!req.file || path.extname(req.file.originalname).toLowerCase() !== '.txt') {
    return res.status(400).send('No TXT file uploaded.');
  }

  const outputName = `${req.file.filename}.pdf`;
  const outputPath = path.join(OUTPUT_DIR, outputName);

  try {
    const text = await fs.readFile(req.file.path, 'utf8');
    const doc = new PDFDocument();
    const stream = doc.pipe(require('fs').createWriteStream(outputPath));
    doc.fontSize(12).text(text, { align: 'left' });
    doc.end();

    stream.on('finish', () => {
      safeUnlink(req.file.path);
      res.json({
        success: true,
        title: 'Conversion: TXT → PDF',
        filename: outputName,
        fileType: 'pdf'
      });
    });
  } catch {
    res.status(500).send('Failed to convert TXT to PDF.');
  }
});

// JPG → PDF
app.post('/convert/jpg-to-pdf', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No JPG file uploaded.' });

  const outputName = `${req.file.filename}.pdf`;
  const outputPath = path.join(OUTPUT_DIR, outputName);

  try {
    const doc = new PDFDocument();
    const stream = doc.pipe(require('fs').createWriteStream(outputPath));

    const imageBuffer = await fs.readFile(req.file.path);
    await sharp(imageBuffer).resize({ fit: 'inside', width: 500 }).toBuffer();

    doc.image(req.file.path, {
      fit: [500, 700],
      align: 'center',
      valign: 'center'
    });

    doc.end();
    stream.on('finish', () => {
      safeUnlink(req.file.path);
      res.json({
        success: true,
        title: 'Conversion: JPG → PDF',
        filename: outputName,
        fileType: 'pdf'
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to convert JPG to PDF.',
      details: err.message
    });
  }
});

// DOCX → PDF (not work!!)
app.post('/convert/docx-to-pdf', upload.single('docx'), async (req, res) => {
  if (!req.file || path.extname(req.file.originalname).toLowerCase() !== '.docx') {
    return res.status(400).send('No DOCX file uploaded.');
  }

  const outputPath = path.join(OUTPUT_DIR, `${req.file.filename}.pdf`);

  try {
    await new Promise((resolve, reject) => {
      exec(`soffice --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${req.file.path}"`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    safeUnlink(req.file.path);

    res.json({
      success: true,
      title: 'Conversion: DOCX → PDF',
      filename: `${req.file.filename}.pdf`,
      fileType: 'pdf'
    });
  } catch (err) {
    res.status(500).send('Failed to convert DOCX to PDF. Is LibreOffice installed?');
  }
});

// Auto-cleanup
async function cleanupOldFiles() {
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
setInterval(cleanupOldFiles, CLEANUP_INTERVAL);

// Server start
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
