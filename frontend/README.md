# PhotoBooth Kiosk - Frontend

React + Electron frontend application for the PhotoBooth Kiosk system.

## Features

- 🎥 Real-time camera capture using React Webcam
- ✨ Photo editing with filters and effects
- 🎨 Frame and sticker customization
- 📱 QR code generation for payment and downloads
- 💳 Stripe payment integration
- 🖨️ Print support
- 📥 Photo download capability

## Tech Stack

- **React 18** - UI framework
- **Electron 28** - Desktop application
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **React Router 6** - Routing
- **Express** - API server (embedded in Electron main process)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Header.jsx
│   ├── screens/
│   │   ├── WelcomeScreen.jsx
│   │   ├── PaymentScreen.jsx
│   │   ├── CameraScreen.jsx
│   │   ├── EditScreen.jsx
│   │   └── ShareScreen.jsx
│   ├── utils/
│   │   └── stripe.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── electron/
│   ├── main.js      # Electron main process + API server
│   └── preload.js   # Electron preload script
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Installation

```bash
cd frontend
npm install
```

## Development

Run the development server with Electron:

```bash
npm run electron:dev
```

Or run just the Vite dev server:

```bash
npm run dev
```

## Building

Build the frontend:

```bash
npm run build
```

Build as Electron app:

```bash
npm run electron:build
```

## Available Routes

- `/` - Welcome screen with pricing info
- `/payment` - Payment selection and QR code
- `/camera` - Photo capture with frame selection
- `/edit` - Photo editing with filters and stickers
- `/share` - Print and download options

## Environment Variables

None required for frontend. Backend URL is hardcoded to `http://localhost:3001`.

## Notes

- The embedded Express server in `electron/main.js` runs on port 3001
- Frontend dev server runs on port 5173
- All API endpoints use CORS for cross-origin requests
