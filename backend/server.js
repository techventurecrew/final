import express from 'express';
import cors from 'cors';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Create photos directory if it doesn't exist
const photosDir = path.join(__dirname, 'photos');
if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

// Routes
app.post('/api/save-photo', async (req, res) => {
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

    res.json({ 
      success: true, 
      filename, 
      filepath,
      url: `http://localhost:${PORT}/api/photos/${filename}`
    });
  } catch (error) {
    console.error('Error saving photo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/print-photo', async (req, res) => {
  try {
    const { filepath } = req.body;
    
    if (!fs.existsSync(filepath)) {
      throw new Error('Photo file not found');
    }

    // In a real implementation, this would send the file to a printer
    // For now, just verify the file exists
    res.json({ success: true, message: 'Print job would be sent to printer' });
  } catch (error) {
    console.error('Error printing photo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, sessionId } = req.body;
    
    // In a real implementation, this would create a Stripe payment session
    // For now, just return a mock response
    res.json({ 
      success: true, 
      sessionId,
      paymentUrl: `https://payment.mock/session/${sessionId}`
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/verify-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // In a real implementation, this would verify with Stripe
    // For now, just return success
    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/photos/:filename', (req, res) => {
  const filepath = path.join(photosDir, req.params.filename);
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'Photo not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'PhotoBooth Backend API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on http://localhost:${PORT}`);
  console.log(`📁 Photos directory: ${photosDir}`);
});
