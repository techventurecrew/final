/**
 * CameraSettings Component
 * 
 * Camera adjustment and photo capture screen where users can:
 * - Adjust brightness, contrast, saturation, and sharpness via sliders
 * - Preview adjustments in real-time on camera feed
 * - Capture multiple photos for grid layouts (one per cell)
 * - Enable auto-capture with 10-second countdown timer
 * - View and edit captured photos as thumbnails (delete to recapture)
 * 
 * Features:
 * - Real-time image adjustment preview
 * - 10-second countdown timer for auto-capture
 * - Progress tracking for multi-photo grids
 * - Editable photo thumbnails gallery with delete functionality
 * - Camera settings persistence
 * 
 * @param {Function} updateSession - Callback to update session data
 * @param {Object} sessionData - Current session data including selected grid
 * @returns {JSX.Element} Camera settings and capture interface
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';
import { generateCompositeFromPhotos } from '../utils/imageComposite';

function CameraSettings({ updateSession, sessionData }) {
  const navigate = useNavigate();

  // Image adjustment states
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [sharpness, setSharpness] = useState(0);
  const [autoCapture, setAutoCapture] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [hoveredPhotoIndex, setHoveredPhotoIndex] = useState(null);
  const [isSavingComposite, setIsSavingComposite] = useState(false);

  // Timer states
  const [timer, setTimer] = useState(10);
  const [timerActive, setTimerActive] = useState(false);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const timerIntervalRef = useRef(null);

  /**
   * Calculate total number of cells needed based on selected grid layout
   */
  const getGridCellCount = () => {
    const grid = sessionData?.selectedGrid;
    if (!grid) return 1;

    if (typeof grid === 'string') {
      if (grid === 'strip-grid') return 4;
    } else if (grid.id === 'strip-grid' || grid.isStripGrid) {
      return 4;
    }

    if (typeof grid === 'string') {
      if (grid === '4x6-single') return 1;
      if (grid === '4x6-2cut') return 2;
      if (grid === '4x6-4cut') return 4;
      if (grid === '4x6-6cut') return 6;
      if (grid === '2x4-vertical-2') return 2;
      if (grid === '5x7-6cut') return 6;
      return 1;
    }
    if (grid.cols && grid.rows) {
      return grid.cols * grid.rows;
    }
    if (grid.id === '4x6-single') return 1;
    if (grid.id === '4x6-2cut') return 2;
    if (grid.id === '4x6-4cut') return 4;
    if (grid.id === '4x6-6cut') return 6;
    if (grid.id === '2x4-vertical-2') return 2;
    if (grid.id === '5x7-6cut') return 6;
    return 1;
  };

  const totalCells = getGridCellCount();
  const isComplete = capturedPhotos.length === totalCells;

  const buildCompositeAndContinue = async (photos) => {
    const gridData = sessionData?.selectedGrid || { id: '4x6-single', cols: 1, rows: 1 };
    setIsSavingComposite(true);
    try {
      const compositeImage = await generateCompositeFromPhotos(photos, gridData);
      updateSession({
        capturedPhotos: photos,
        editedPhotos: photos,
        compositeImage,
        selectedGrid: gridData,
      });
      navigate('/frame-selection');
    } catch (error) {
      console.error('Failed to generate composite from captured photos:', error);
      setIsSavingComposite(false);
    }
  };

  /**
   * Start countdown timer for automatic photo capture
   */
  const startTimer = () => {
    setTimer(10);
    setTimerActive(true);
  };

  /**
   * Cancel the active timer
   */
  const cancelTimer = () => {
    setTimerActive(false);
    setTimer(10);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive) return;

    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setTimerActive(false);
          // Auto-capture when timer reaches 0
          setTimeout(() => {
            handleCapture();
          }, 100);
          return 10;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('CameraSettings - Grid info:', {
      selectedGrid: sessionData?.selectedGrid,
      totalCells,
      capturedPhotos: capturedPhotos.length,
      gridType: typeof sessionData?.selectedGrid
    });
  }, [sessionData?.selectedGrid, totalCells]);

  // Simple face detection using canvas-based approach
  useEffect(() => {
    const detectFace = async () => {
      if (!webcamRef.current) return;

      const interval = setInterval(async () => {
        try {
          const imageSrc = webcamRef.current?.getScreenshot();
          if (!imageSrc) return;

          const img = new Image();
          img.src = imageSrc;
          img.onload = () => {
            const canvas = canvasRef.current || document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let facePixels = 0;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
                facePixels++;
              }
            }

            const faceRatio = facePixels / (canvas.width * canvas.height);
            setFaceDetected(faceRatio > 0.05);
          };
        } catch (err) {
          // Silently handle detection errors
        }
      }, 500);

      return () => clearInterval(interval);
    };

    if (autoCapture && !isComplete) {
      detectFace();
    }
  }, [autoCapture, isComplete]);

  const apply = () => {
    updateSession({ cameraSettings: { brightness: parseFloat(brightness), contrast: parseFloat(contrast), saturation: parseFloat(saturation), sharpness: parseFloat(sharpness), autoCapture } });
    navigate('/camera-filter');
  };

  const getCameraFilter = () => {
    const filterStyles = {
      none: 'none',
      sepia: 'sepia(0.6)',
      vintage: 'sepia(0.4) contrast(0.9) saturate(0.8)',
      cool: 'hue-rotate(200deg) saturate(1.1)',
      mono: 'grayscale(1)',
    };
    const cameraFilter = sessionData?.cameraFilter || 'none';
    const cameraBrightness = sessionData?.brightness || 100;
    const baseFilter = filterStyles[cameraFilter];
    const cameraBrightnessMultiplier = cameraBrightness / 100;
    const combinedBrightness = cameraBrightnessMultiplier * parseFloat(brightness);

    let filterParts = [];
    if (baseFilter !== 'none') {
      filterParts.push(baseFilter);
    }
    filterParts.push(`brightness(${combinedBrightness})`);
    filterParts.push(`contrast(${contrast})`);
    filterParts.push(`saturate(${saturation})`);

    return filterParts.join(' ');
  };

  const getCombinedFilter = () => {
    return getCameraFilter();
  };

  const handleCapture = async () => {
    // Cancel timer if it's running
    if (timerActive) {
      cancelTimer();
    }

    const settings = { brightness: parseFloat(brightness), contrast: parseFloat(contrast), saturation: parseFloat(saturation), sharpness: parseFloat(sharpness), autoCapture };
    updateSession({ cameraSettings: settings });

    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = img.width;
        const h = img.height;

        canvas.width = w;
        canvas.height = h;
        ctx.filter = getCombinedFilter();
        ctx.drawImage(img, 0, 0);

        const photoData = canvas.toDataURL('image/jpeg', 0.95);
        const newPhotos = [...capturedPhotos, photoData];
        setCapturedPhotos(newPhotos);

        const nextIndex = newPhotos.length;
        setCurrentPhotoIndex(nextIndex);

        if (newPhotos.length === totalCells) {
          buildCompositeAndContinue(newPhotos);
        }
      };
    } catch (err) {
      console.error('Capture failed', err);
    }
  };

  /**
   * Delete a specific captured photo by index
   */
  const handleDeletePhoto = (index) => {
    const updatedPhotos = capturedPhotos.filter((_, i) => i !== index);
    setCapturedPhotos(updatedPhotos);
    setCurrentPhotoIndex(updatedPhotos.length);
    setHoveredPhotoIndex(null);
  };

  const filter = getCombinedFilter();

  return (
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="w-screen h-screen flex items-center justify-center overflow-hidden">
      <FallingHearts />
      <div
        style={{
          height: "100%",
          background: "#f7f4E8",
          border: "5px solid #FF6B6A",
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
        className="max-w-4xl w-full h-full bg-white rounded-2xl border-4 border-rose-200 flex flex-col">
        <h2 className="text-2xl py-2 font-bold mb-2 text-center" style={{ fontFamily: "'Quicksand', sans-serif", color: '#6B2D9B', fontSize: 36 }}>
          Camera Settings - Photo {capturedPhotos.length + 1} of {totalCells}
          {capturedPhotos.length === totalCells && <span className="text-green-600 ml-2">✓ Complete!</span>}
        </h2>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-rose-500 h-2 rounded-full transition-all"
            style={{ width: `${(capturedPhotos.length / totalCells) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden mx-4">
          <div className="overflow-y-auto pr-2">
            {/* Show captured photos thumbnails */}
            {capturedPhotos.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Captured ({capturedPhotos.length}/{totalCells})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {capturedPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-rose-300 rounded-lg overflow-hidden relative group cursor-pointer"
                      onMouseEnter={() => setHoveredPhotoIndex(idx)}
                      onMouseLeave={() => setHoveredPhotoIndex(null)}
                    >
                      <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-auto" />

                      {/* Photo number badge */}
                      <div style={{ fontFamily: "'Poppins', sans-serif" }} className="absolute top-1 left-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {idx + 1}
                      </div>

                      {/* Delete button - appears on hover */}
                      {hoveredPhotoIndex === idx && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <button
                            onClick={() => handleDeletePhoto(idx)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-md text-center mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Preview</h3>
            <div className="bg-gray-900 rounded-lg overflow-hidden p-1 flex-1 flex items-center justify-center relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: 'user',
                  height: { ideal: 1280 },
                  width: { ideal: 720 }
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: filter }}
              />

              {/* Timer Display */}
              {timerActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    style={{
                      fontSize: '80px',
                      fontWeight: 'bold',
                      color: timer <= 3 ? '#ff4444' : '#ffffff',
                      textShadow: '0 0 20px rgba(0,0,0,0.8)',
                      fontFamily: "'Poppins', sans-serif",
                      animation: timer <= 3 ? 'pulse 0.5s infinite' : 'none'
                    }}
                  >
                    {timer}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Real-time adjustments will apply.</p>

            {/* Capture status message */}
            {!isComplete && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {totalCells > 1 ? (
                  <>📸 Capture {totalCells - capturedPhotos.length} more photo{totalCells - capturedPhotos.length !== 1 ? 's' : ''} to complete the grid</>
                ) : (
                  <>📸 Capture your photo</>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <button onClick={() => {
            cancelTimer();
            if (capturedPhotos.length > 0) {
              const updatedPhotos = capturedPhotos.slice(0, -1);
              setCapturedPhotos(updatedPhotos);
              setCurrentPhotoIndex(updatedPhotos.length);
            } else {
              navigate('/camera-filter');
            }
          }} className="px-3 rounded-lg border-2 text-sm m-2 hover:bg-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {capturedPhotos.length > 0 ? 'Remove Last' : 'Back'}
          </button>
          <div className="flex gap-2 m-2">
            {!isComplete && (
              <button onClick={apply} className="px-3 py-1 rounded-lg bg-rose-300 font-bold text-xs hover:bg-rose-400" style={{ fontFamily: "'Poppins', sans-serif" }}>Skip Capture</button>
            )}

            {/* Timer Controls */}
            {timerActive ? (
              <button
                onClick={cancelTimer}
                className="px-4 py-2 rounded-lg font-bold text-white text-sm bg-red-500 hover:bg-red-600 shadow-lg"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                ⏹️ Cancel Timer
              </button>
            ) : (
              <>
                <button
                  onClick={startTimer}
                  disabled={isComplete || isSavingComposite}
                  className={`px-4 py-2 rounded-lg font-bold text-white text-sm ${(isComplete || isSavingComposite) ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 shadow-lg'}`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  ⏱️ Timer (10s)
                </button>

                <button
                  onClick={handleCapture}
                  disabled={isComplete || isSavingComposite}
                  className={`px-4 py-2 rounded-lg font-bold text-white text-sm ${(isComplete || isSavingComposite) ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 shadow-lg'}`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {isSavingComposite
                    ? 'Preparing photos…'
                    : isComplete
                      ? 'Complete ✓'
                      : `📸 Capture Photo ${capturedPhotos.length + 1}/${totalCells}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default CameraSettings;