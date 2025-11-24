import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import sharp from 'sharp';
import printer from 'pdf-to-printer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== 'production';
const photosDir = path.join(app.getPath('userData'), 'photos');
const sessionsDir = path.join(app.getPath('userData'), 'sessions');

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

let mainWindow;
const apiServer = express();
apiServer.use(cors());
apiServer.use(express.json({ limit: '50mb' }));

apiServer.post('/api/save-photo', async (req, res) => {
  try {
    const { imageData, sessionId, filters } = req.body;
    const timestamp = Date.now();
    const filename = `photo_${sessionId}_${timestamp}.jpg`;
    const filepath = path.join(photosDir, filename);

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    let image = sharp(buffer);

    if (filters) {
      if (filters.grayscale) {
        image = image.grayscale();
      }
      if (filters.blur) {
        image = image.blur(filters.blur);
      }
      if (filters.brightness) {
        image = image.modulate({ brightness: filters.brightness });
      }
    }

    await image.jpeg({ quality: 90 }).toFile(filepath);

    res.json({ success: true, filename, filepath });
  } catch (error) {
    console.error('Error saving photo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

apiServer.post('/api/print-photo', async (req, res) => {
  try {
    const { filepath } = req.body;
    
    if (!fs.existsSync(filepath)) {
      throw new Error('Photo file not found');
    }

    await printer.print(filepath);
    
    res.json({ success: true, message: 'Print job sent successfully' });
  } catch (error) {
    console.error('Error printing photo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

apiServer.get('/api/photos/:filename', (req, res) => {
  const filepath = path.join(photosDir, req.params.filename);
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'Photo not found' });
  }
});

apiServer.listen(3001, () => {
  console.log('API server running on port 3001');
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: !isDev,
    kiosk: !isDev,
    frame: isDev,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('get-photos-dir', () => photosDir);
ipcMain.handle('get-sessions-dir', () => sessionsDir);
