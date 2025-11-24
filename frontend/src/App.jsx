import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import PaymentScreen from './screens/PaymentScreen';
import Page2 from './screens/Page2';
import CashPassword from './screens/CashPassword';
import GridSelection from './screens/GridSelection';
import CameraFilter from './screens/CameraFilter';
import CameraSettings from './screens/CameraSettings';
import CameraScreen from './screens/CameraScreen';
import EditScreen from './screens/EditScreen';
import ShareScreen from './screens/ShareScreen';
import ThankYou from './screens/ThankYou';
import PaymentQR from './screens/PaymentQR';
import FrameSelectionScreen from './screens/FrameSelectionScreen';
import StickerEditorScreen from './screens/StickerEditorScreen';
import PhotoBoothFrames from './screens/PhotoBoothFrames';
// import CombinedCamera from './screens/CombinedCamera';
// Header removed: app uses full-screen pages without a nav/header

function App() {
  const [sessionData, setSessionData] = useState({
    sessionId: null,
    capturedPhoto: null,
    editedPhoto: null,
    paymentStatus: 'pending',
  });

  const updateSession = (data) => {
    setSessionData(prev => ({ ...prev, ...data }));
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<WelcomeScreen updateSession={updateSession} />} />
          <Route path="/payment" element={<Page2 />} />
          <Route path="/cash-password" element={<CashPassword updateSession={updateSession} />} />
          <Route path="/grid" element={<GridSelection updateSession={updateSession} />} />
          <Route path="/camera-filter" element={<CameraFilter updateSession={updateSession} />} />
          <Route
            path="/frame-selection"
            element={<FrameSelectionScreen sessionData={sessionData} updateSession={updateSession} />}
          />          {/* <Route path="/camera-combine" element={<CombinedCamera updateSession={updateSession} />} /> */}
          <Route
            path="/stickers"
            element={<StickerEditorScreen sessionData={sessionData} updateSession={updateSession} />}
          />          {/* <Route path="/camera-combine" element={<CombinedCamera updateSession={updateSession} />} /> */}
          <Route path="/camera-settings" element={<CameraSettings sessionData={sessionData} updateSession={updateSession} />} />
          <Route path="/frame" element={<PhotoBoothFrames sessionData={sessionData} updateSession={updateSession} />} />
          <Route path="/payment-full" element={<PaymentScreen sessionData={sessionData} updateSession={updateSession} />} />
          <Route path="/payment-qr" element={<PaymentQR sessionData={sessionData} updateSession={updateSession} />} />
          <Route path="/camera" element={<CameraScreen sessionData={sessionData} updateSession={updateSession} />} />
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/edit" element={<EditScreen sessionData={sessionData} updateSession={updateSession} />} />
          <Route path="/share" element={<ShareScreen sessionData={sessionData} updateSession={updateSession} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
