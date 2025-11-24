import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';

function CameraScreen({ sessionData, updateSession }) {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [currentCell, setCurrentCell] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [applyingFilter, setApplyingFilter] = useState(false);

  const filterStyles = {
    none: 'none',
    sepia: 'sepia(0.6)',
    vintage: 'sepia(0.4) contrast(0.9) saturate(0.8)',
    cool: 'hue-rotate(200deg) saturate(1.1)',
    mono: 'grayscale(1)',
  };

  const getCombinedFilter = () => {
    const cameraFilter = sessionData.cameraFilter || 'none';
    const brightness = sessionData.brightness || 100;
    const baseFilter = filterStyles[cameraFilter];
    const brightnessFilter = `brightness(${brightness}%)`;
    return baseFilter === 'none' ? brightnessFilter : `${baseFilter} ${brightnessFilter}`;
  };



  useEffect(() => {
    if (sessionData.paymentStatus !== 'completed') {
      navigate('/payment');
    }
  }, [sessionData.paymentStatus, navigate]);

  // Ensure camera permissions and availability on mount.
  useEffect(() => {
    let localStream = null;
    const ensureCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraAvailable(false);
        setCameraError('Camera API not available in this browser');
        return;
      }

      try {
        // Request a short permission to ensure user grants access. Stop tracks immediately;
        localStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraAvailable(true);
        setCameraError(null);
        // Stop tracks: react-webcam will open its own stream when rendering
        localStream.getTracks().forEach((t) => t.stop());
        localStream = null;
      } catch (err) {
        setCameraAvailable(false);
        setCameraError(err && err.message ? err.message : 'Unable to access camera');
      }
    };

    ensureCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const frames = {
    none: { name: 'No Frame', style: '' },
    classic: { name: 'Classic', style: 'border-8 border-white shadow-2xl' },
    gold: { name: 'Gold', style: 'border-8 border-yellow-400 shadow-2xl' },
    fun: { name: 'Fun', style: 'border-8 border-primary-500 shadow-2xl rounded-3xl' },
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  // If autoCapture is enabled in camera settings, kick off a 5s countdown
  useEffect(() => {
    const settings = sessionData.cameraSettings;
    const grid = sessionData.selectedGrid || { cols: 1, rows: 1 };
    const totalCells = grid.cols * grid.rows;
    if (settings && settings.autoCapture && capturedImages.length < totalCells) {
      setCountdown(5);
    }
  }, [sessionData.cameraSettings, capturedImages, sessionData.selectedGrid]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      capturePhoto();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setCountdown(null);
      return;
    }

    const grid = sessionData.selectedGrid || { cols: 1, rows: 1 };
    // Strip-grid needs 4 photos (1 column × 4 rows, will be duplicated in composite)
    const isStripGrid = grid.id === 'strip-grid' || grid.isStripGrid;
    const totalCells = isStripGrid ? 4 : (grid.cols * grid.rows);

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply the filter to the canvas context
      ctx.filter = getCombinedFilter();

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Get the new base64 image with the filter applied
      const filteredImageSrc = canvas.toDataURL('image/jpeg', 0.95);

      // For multi-cell grids, capture full image for each cell
      if (totalCells > 1) {
        setCapturedImages(prev => [...prev, filteredImageSrc]);
        setCurrentCell(prev => prev + 1);
        setCountdown(null);
        // If more cells to capture, start next countdown after a short delay
        if (currentCell + 1 < totalCells) {
          setTimeout(() => setCountdown(3), 1000);
        }
      } else {
        // Single cell: crop if needed, but for now keep full image
        setCapturedImages([filteredImageSrc]);
        setCountdown(null);
      }
    };
  };

  const handleRetake = () => {
    setCapturedImages([]);
    setCurrentCell(0);
    setCountdown(null);
  };

  const handleNext = () => {
    const grid = sessionData.selectedGrid || { cols: 1, rows: 1 };
    // Strip-grid needs 4 photos (1 column × 4 rows, will be duplicated in composite)
    const isStripGrid = grid.id === 'strip-grid' || grid.isStripGrid;
    const totalCells = isStripGrid ? 4 : (grid.cols * grid.rows);
    if (capturedImages.length === totalCells) {
      updateSession({
        capturedPhotos: capturedImages,
        selectedFrame: selectedFrame
      });
      navigate('/edit');
    }
  };

  return (
    <div className="screen-container items-center justify-center overflow-hidden">
      <FallingHearts />
      <div className="max-w-7xl w-full h-full flex flex-col">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {(() => {
              const grid = sessionData.selectedGrid || { cols: 1, rows: 1 };
              const isStripGrid = grid.id === 'strip-grid' || grid.isStripGrid;
              const totalCells = isStripGrid ? 4 : (grid.cols * grid.rows);
              if (capturedImages.length === totalCells && totalCells > 1) {
                return 'Review Your Photos';
              } else if (capturedImages.length > 0 && totalCells > 1) {
                return `Capturing Photo ${currentCell + 1} of ${totalCells}`;
              } else if (capturedImages.length === 1) {
                return 'Review Your Photo';
              } else {
                return 'Strike a Pose!';
              }
            })()}
          </h2>
          <p className="text-lg text-gray-600">
            {(() => {
              const grid = sessionData.selectedGrid || { cols: 1, rows: 1 };
              const isStripGrid = grid.id === 'strip-grid' || grid.isStripGrid;
              const totalCells = isStripGrid ? 4 : (grid.cols * grid.rows);
              if (capturedImages.length === totalCells && totalCells > 1) {
                return 'Happy with your photos? Click next to continue';
              } else if (capturedImages.length > 0 && totalCells > 1) {
                return 'Pose for the next photo';
              } else if (capturedImages.length === 1) {
                return 'Happy with your photo? Click next to continue';
              } else {
                return 'Select a frame and click capture when ready';
              }
            })()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1">
          <div className="col-span-2">
            <div className="card p-4 h-full flex flex-col">
              <div className="relative bg-black rounded-2xl overflow-hidden flex-1">
                {(() => {
                  const grid = sessionData.selectedGrid || { cols: 1, rows: 1 };
                  const isStripGrid = grid.id === 'strip-grid' || grid.isStripGrid;
                  const totalCells = isStripGrid ? 1 : (grid.cols * grid.rows);
                  if (capturedImages.length === totalCells && totalCells > 1) {
                    // Show grid of captured images
                    return (
                      <div className={`grid gap-2 p-2 ${frames[selectedFrame].style}`} style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, 1fr)` }}>
                        {capturedImages.map((img, index) => (
                          <img key={index} src={img} alt={`Captured ${index + 1}`} className="w-full h-full object-cover" />
                        ))}
                      </div>
                    );
                  } else if (capturedImages.length === 1) {
                    // Show single captured image (for single photo or strip-grid)
                    return (
                      <div className={frames[selectedFrame].style}>
                        <img src={capturedImages[0]} alt="Captured" className="w-full h-auto" />
                      </div>
                    );
                  } else {
                    // Show camera feed
                    const videoConstraints = {
                      width: 1280,
                      height: 720,
                      facingMode: 'user',
                    };
                    return (
                      <div className={`relative h-full w-full ${frames[selectedFrame].style}`}>
                        {cameraAvailable ? (
                          <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-auto"
                            style={{
                              filter: getCombinedFilter(),
                            }}
                            onUserMedia={() => setCameraAvailable(true)}
                            onUserMediaError={(error) => {
                              setCameraAvailable(false);
                              setCameraError(error?.message || 'Camera access denied');
                            }}
                          />
                        ) : (
                          <div className="w-full h-64 flex items-center justify-center text-center p-6 text-lg text-white">
                            <div>
                              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Camera unavailable</div>
                              <div style={{ opacity: 0.9 }}>{cameraError || 'Please allow camera access and refresh.'}</div>
                            </div>
                          </div>
                        )}
                        {countdown !== null && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="text-white text-9xl font-bold animate-bounce">
                              {countdown}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>

              <div className="mt-4 flex justify-center gap-2">
                {(() => {
                  const grid = sessionData.selectedGrid || { cols: 1, rows: 1 };
                  const isStripGrid = grid.id === 'strip-grid' || grid.isStripGrid;
                  const totalCells = isStripGrid ? 1 : (grid.cols * grid.rows);
                  if (capturedImages.length === totalCells) {
                    return (
                      <>
                        <button
                          onClick={handleRetake}
                          className="btn-outline text-sm"
                        >
                          🔄 Retake
                        </button>
                        <button
                          onClick={handleNext}
                          className="btn-primary text-sm"
                        >
                          Next: Edit →
                        </button>
                      </>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => {
                          // save selected frame and go to adjustments page where capture happens
                          updateSession({ selectedFrame });
                          navigate('/camera-settings');
                        }}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next: Adjust & Capture →
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          <div className="col-span-1 h-full">
            <div className="card p-4 h-full flex flex-col overflow-hidden">
              <h3 className="text-2xl font-bold mb-3">Select Frame</h3>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {Object.entries(frames).map(([key, frame]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFrame(key)}
                    disabled={capturedImages.length > 0}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${selectedFrame === key
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                      } ${capturedImages.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-lg font-semibold">{frame.name}</div>
                    <div className="mt-1">
                      <div className={`w-full h-12 bg-gray-200 ${frame.style}`}></div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-2 p-3 bg-primary-50 rounded-xl text-sm">
                <h4 className="font-semibold mb-1">📌 Tips:</h4>
                <ul className="space-y-1 text-gray-700 text-xs">
                  <li>• Look at camera</li>
                  <li>• Smile naturally</li>
                  <li>• Good lighting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-1">
          <button
            onClick={() => navigate('/payment')}
            className="text-xs py-1 px-3 rounded-lg border-2 hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default CameraScreen;
