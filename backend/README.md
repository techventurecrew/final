# PhotoBooth Kiosk - Backend

Node.js/Express backend API for the PhotoBooth Kiosk system.

## Features

- 🖼️ Photo saving and processing with Sharp
- 📄 Image format conversion and optimization
- 💳 Payment session creation and verification
- 🖨️ Print job management
- 📥 Photo download endpoint
- ⚙️ CORS enabled for frontend communication

## Tech Stack

- **Node.js** - Runtime
- **Express 4** - Web framework
- **Sharp 0.33** - Image processing
- **CORS 2.8** - Cross-origin support
- **pdf-to-printer 5.5** - Print functionality

## Project Structure

```
backend/
├── server.js
├── package.json
└── photos/        # Directory for saved photos (created at runtime)
```

## Installation

```bash
cd backend
npm install
```

## Development

Start the backend server:

```bash
npm run dev
# or
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST `/api/save-photo`
Save and process a photo from the frontend.

**Request:**
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "sessionId": "session_123456789",
  "filters": {
    "grayscale": false,
    "blur": 0,
    "brightness": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "filename": "photo_session_123456789_1234567890.jpg",
  "filepath": "/path/to/photos/photo_session_123456789_1234567890.jpg",
  "url": "http://localhost:3001/api/photos/photo_session_123456789_1234567890.jpg"
}
```

### POST `/api/print-photo`
Send a photo to the printer.

**Request:**
```json
{
  "filepath": "/path/to/photos/photo_session_123456789_1234567890.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Print job sent successfully"
}
```

### POST `/api/create-payment`
Create a payment session.

**Request:**
```json
{
  "amount": 1200,
  "sessionId": "session_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_123456789",
  "paymentUrl": "https://payment.mock/session/session_123456789"
}
```

### GET `/api/verify-payment/:sessionId`
Verify payment status.

**Response:**
```json
{
  "success": true,
  "sessionId": "session_123456789"
}
```

### GET `/api/photos/:filename`
Download a saved photo.

Returns the image file in JPEG format.

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "service": "PhotoBooth Backend API"
}
```

## Configuration

### Environment Variables

- `PORT` (optional) - Server port (default: 3001)

### Photos Directory

Photos are stored in the `photos/` directory relative to the server. This directory is created automatically on first run.

## Development Notes

- Sharp is used for image processing (resizing, filtering, format conversion)
- pdf-to-printer is used for printer integration on Windows/macOS/Linux
- CORS is enabled for all origins to allow frontend communication
- Request payload limit is set to 50MB for image data
- Images are saved as JPEG with 90% quality

## Notes for Frontend Integration

The frontend expects the backend to run on `http://localhost:3001`. Make sure:
1. Backend is started before frontend
2. Port 3001 is available
3. Both services are running on the same machine (or update URLs in frontend code)

## Future Enhancements

- [ ] Stripe integration for real payments
- [ ] Database for session persistence
- [ ] Authentication and authorization
- [ ] Photo retention policies
- [ ] Printer queue management
- [ ] Analytics and reporting
