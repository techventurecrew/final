/**
 * ShareScreen Component
 * 
 * Final screen where users can print or download their completed photo(s).
 * Displays the composite image (or single photo) and provides options to:
 * - Print the photo(s) using connected printer
 * - Download photo(s) via direct download or QR code
 * - Start a new photo session
 * 
 * Features:
 * - Composite image preview (grid layout or single photo)
 * - Print functionality with status feedback
 * - Download functionality with QR code generation
 * - Server-side photo saving and URL generation
 * - Navigation to start new session
 * - Auto-redirect to thank you page after 10 seconds
 * 
 * @param {Object} sessionData - Current session data including edited photos and composite
 * @param {Function} updateSession - Callback to update session data
 * @returns {JSX.Element} Share/Print/Download screen
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';
import { detectPrinters, getDefaultPrinter, getStoredPrinter, saveSelectedPrinter } from '../utils/printerDetection';
import { getPageSizeFromGrid, extractStripFromComposite } from '../utils/imageComposite';

function ShareScreen({ sessionData, updateSession }) {
  const navigate = useNavigate();
  // Print status: 'idle', 'printing', 'success', or 'error'
  const [printStatus, setPrintStatus] = useState('idle');
  // Array of saved photo filenames from server
  const [savedFilenames, setSavedFilenames] = useState([]);
  // Array of download URLs for QR codes
  const [downloadUrls, setDownloadUrls] = useState([]);
  // Current photo index for multi-photo viewing
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  // Countdown timer for auto-redirect
  const [countdown, setCountdown] = useState(10);
  // Available printers list
  const [availablePrinters, setAvailablePrinters] = useState([]);
  // Selected printer
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  // Page size configuration
  const [pageSizeConfig, setPageSizeConfig] = useState(null);

  // Get edited photos: Support both legacy single photo and new multi-photo format
  const editedPhotos = sessionData.editedPhotos || (sessionData.editedPhoto ? [sessionData.editedPhoto] : []);
  // Use composite image for print/download (grid layout), or fallback to first photo
  const compositeImage = sessionData.compositeImage || editedPhotos[0] || editedPhotos;
  // Current photo to display (for preview)
  const currentPhoto = editedPhotos[currentPhotoIndex] || compositeImage;
  // Check if multiple photos exist (for display purposes)
  const isMultiPhoto = editedPhotos.length > 1;
  // Display image (extract strip for strip-grid, otherwise use full composite)
  const [displayImage, setDisplayImage] = useState(compositeImage || currentPhoto);

  // Extract strip for display if it's a strip-grid
  useEffect(() => {
    const grid = sessionData?.selectedGrid;
    const isStripGrid = grid && (grid.id === 'strip-grid' || grid.isStripGrid);
    
    if (isStripGrid && compositeImage) {
      extractStripFromComposite(compositeImage, 300)
        .then(stripImage => {
          setDisplayImage(stripImage);
        })
        .catch(error => {
          console.error('Error extracting strip for display:', error);
          setDisplayImage(compositeImage);
        });
    } else {
      setDisplayImage(compositeImage || currentPhoto);
    }
  }, [compositeImage, currentPhoto, sessionData?.selectedGrid]);

  // Auto-redirect to thank you page after 10 seconds
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/thankyou');
    }, 10000); // 10 seconds

    // Countdown timer for visual feedback
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  // Auto-detect printers on component mount
  useEffect(() => {
    const initializePrinters = async () => {
      try {
        const printers = await detectPrinters();
        setAvailablePrinters(printers);

        // Get stored printer or use default
        const storedPrinter = getStoredPrinter();
        const defaultPrinter = storedPrinter || getDefaultPrinter(printers);
        setSelectedPrinter(defaultPrinter);
      } catch (error) {
        console.error('Error initializing printers:', error);
        // Set default printer on error
        setSelectedPrinter({ name: 'Default Printer', status: 'Unknown' });
      }
    };

    initializePrinters();
  }, []);

  // Auto-configure page size based on grid
  useEffect(() => {
    const grid = sessionData.selectedGrid;
    if (grid) {
      const config = getPageSizeFromGrid(grid);
      setPageSizeConfig(config);
      console.log('Auto-configured page size:', config);
    }
  }, [sessionData.selectedGrid]);

  // Auto-save composite image to server when component mounts or image changes
  useEffect(() => {
    // Redirect to edit screen if no photos available
    if (!editedPhotos || editedPhotos.length === 0) {
      navigate('/edit');
      return;
    }

    // Save composite image to server for printing/downloading
    // Use composite if available (grid layout), otherwise use first photo (single photo)
    const imageToSave = compositeImage || editedPhotos[0];
    if (imageToSave) {
      savePhoto(imageToSave, 0);
    }
  }, [editedPhotos, compositeImage]);

  /**
   * Save photo to server
   * Sends photo data to backend API and receives filename and URL for download
   * 
   * @param {string} photoData - Base64 encoded image data
   * @param {number} index - Photo index for multi-photo sessions
   */
  const savePhoto = async (photoData, index) => {
    try {
      const response = await fetch('http://localhost:3001/api/save-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: photoData,
          sessionId: sessionData.sessionId,
          photoIndex: index,
          totalPhotos: editedPhotos.length,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSavedFilenames(prev => {
          const updated = [...prev];
          updated[index] = data.filename;
          return updated;
        });
        setDownloadUrls(prev => {
          const updated = [...prev];
          updated[index] = `http://localhost:3001/api/photos/${data.filename}`;
          return updated;
        });
      }
    } catch (error) {
      console.error('Error saving photo:', error);
    }
  };

  /**
   * Handle Print button click
   * Sends print request to backend API with saved photo filename, printer, and page size
   * Updates print status to provide user feedback
   */
  const handlePrint = async () => {
    // Set status to printing for user feedback
    setPrintStatus('printing');

    try {
      // Use composite image for printing (grid layout or single photo)
      const imageToPrint = compositeImage || editedPhotos[0];

      // Ensure photo is saved to server before printing
      if (savedFilenames.length === 0 || !savedFilenames[0]) {
        await savePhoto(imageToPrint, 0);
        // Wait for save to complete before sending print request
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Get filename for printing
      const filename = savedFilenames[0];

      // Get grid for page size configuration
      const grid = sessionData.selectedGrid || { cols: 1, rows: 1, id: '4x6-single' };

      // Get page size configuration
      const pageSize = pageSizeConfig?.pageSize || getPageSizeFromGrid(grid).pageSize;

      // Send print request to backend API with printer and page size
      // Backend will construct the filepath from filename
      const response = await fetch('http://localhost:3001/api/print-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filename,
          printerName: selectedPrinter?.name || 'Default',
          pageSize: pageSize,
          grid: grid,
          sessionId: sessionData.sessionId,
        }),
      });

      const data = await response.json();

      setTimeout(() => {
        setPrintStatus(data.success ? 'success' : 'error');
      }, 2000);
    } catch (error) {
      console.error('Error printing photo:', error);
      setPrintStatus('error');
    }
  };

  /**
   * Handle Download button click
   * Triggers browser download of the composite image
   * Uses the composite image for grid layouts, or single photo for single photo sessions
   */
  const handleDownload = () => {
    // Always download the composite image (grid layout) or single photo
    const imageToDownload = compositeImage || editedPhotos[0];

    // Create temporary download link and trigger click
    const link = document.createElement('a');
    link.href = imageToDownload;
    link.download = `photobooth_${sessionData.sessionId}_composite.jpg`;
    link.click();
  };

  /**
   * Handle Start Over button click
   * Resets session data and navigates back to welcome screen
   * Allows user to start a new photo session
   */
  const handleStartOver = () => {
    // Clear all session data
    updateSession({
      sessionId: null,
      capturedPhotos: null,
      capturedPhoto: null,
      editedPhotos: null,
      editedPhoto: null,
      paymentStatus: 'pending',
    });
    // Navigate to welcome screen
    navigate('/');
  };

  return (
    // Main container with gradient background
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="screen-container items-center justify-center overflow-hidden">
      <TwinklingStars />
      <div
        style={{
          height: "90%",
          background: "#f7f4E8", // Cream white background
          border: "5px solid #FF6B6A", // Coral-pink border
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
        className="max-w-6xl w-full h-full flex flex-col animate-fade-in p-2 rounded-xl">
        {/* Page header */}
        <div className="text-center mb-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Quicksand', sans-serif", color: '#6B2D9B', fontSize: 36 }}>Photo Ready!</h2>
          <p className="text-xs text-gray-600">{isMultiPhoto ? `Photo ${currentPhotoIndex + 1} of ${editedPhotos.length}` : 'Print or download'}</p>
          {/* Countdown timer display */}
          <p className="text-xs text-gray-500 mt-1">Redirecting in {countdown}s...</p>
        </div>

        {/* Main content: Preview and action panels */}
        <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden min-h-0 m-3">
          {/* Left panel: Photo preview */}
          <div className="min-h-0">
            <div className="card p-3 h-full flex flex-col">
              {/* Preview label */}
              {/* <h3 className="text-md font-bold text-center">Preview (Composite)</h3> */}
              {/* Photo display area: Black background for better contrast */}
              <div className=" rounded-lg overflow-hidden flex-1 min-h-0">
                {/* Composite image or single photo (shows only one strip for strip-grid) */}
                <img
                  src={displayImage}
                  alt="Final Composite"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute bottom-1 left-0">
                <img src="/images/final-download.png" alt="teddy kiss" style={{ width: 260, bottom: 1, right: 1 }} />
              </div>
              {/* Info text for multi-photo grids */}
              {isMultiPhoto && (
                <p className="text-xs text-center mt-1 text-gray-600">
                  Showing composite of {editedPhotos.length} photos
                </p>
              )}
            </div>
          </div>

          {/* Right panel: Print and Download options */}
          <div className="space-y-2 overflow-hidden  min-h-0 ">
            {/* Print section */}
            <div className="card p-3">
              <h3 className="text-sm font-bold mb-2 text-center">🖨️ Print Now</h3>

              {/* Printer and page size info */}
              {selectedPrinter && (
                <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">Printer:</span>
                    <span className="text-gray-700">{selectedPrinter.name}</span>
                  </div>
                  {pageSizeConfig && (
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Page Size:</span>
                      <span className="text-gray-700">{pageSizeConfig.pageSize}</span>
                    </div>
                  )}
                </div>
              )}

              {printStatus === 'idle' && (
                <button
                  onClick={handlePrint}
                  className="btn-primary w-full text-sm "
                  style={{
                    fontFamily: 'sans-serif',
                    background: "#FFB6C1", // Light pink background
                    padding: "18px 60px",
                    borderRadius: 18,
                    boxShadow: "0 8px 20px rgba(246,100,130,0.18)", // Subtle shadow
                    border: "3px solid #FF6B6A", // Coral-pink border
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#D83A4A", // Deep pink text
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textShadow: "2px 2px 2px 5pxrgba(216, 58, 74, 0.7)"
                  }}
                >
                  Print Photo Now
                </button>
              )}

              {printStatus === 'printing' && (
                <div className="text-center py-4">
                  <div className="animate-spin text-4xl mb-2">⚙️</div>
                  <p className="text-lg font-semibold">Printing...</p>
                </div>
              )}

              {printStatus === 'success' && (
                <div className="text-center py-2 animate-fade-in">
                  <div className="text-3xl mb-1">✅</div>
                  <p className="text-sm font-semibold text-green-600">Success!</p>
                  <p className="text-xs text-gray-600">Collect from printer</p>
                </div>
              )}

              {printStatus === 'error' && (
                <div className="text-center py-2 animate-fade-in">
                  <div className="text-3xl mb-1">❌</div>
                  <p className="text-sm font-semibold text-red-600">Failed</p>
                  <p className="text-xs text-gray-600">Try download</p>
                </div>
              )}
            </div>

            {/* Download section */}
            <div className="card p-3">
              <h3 className="text-sm font-bold mb-2 text-center">📱 Download Now</h3>

              {/* QR Code display: Shows when download URL is ready */}
              {downloadUrls.length > 0 && downloadUrls[currentPhotoIndex] ? (
                <>
                  {/* QR Code container: White background for better contrast */}
                  <div className="flex justify-center mb-2">
                    <div className="bg-white p-2 rounded-lg shadow-lg">
                      {/* QR Code for mobile scanning */}
                      <QRCodeSVG
                        value={downloadUrls[currentPhotoIndex]}
                        size={120}
                        level="H" // High error correction for better scanning
                        includeMargin={true}
                      />
                    </div>
                  </div>
                  {/* QR Code instruction */}
                  <p className="text-center text-xs text-gray-600 mb-2">
                    Scan to download
                  </p>
                </>
              ) : (
                /* Loading state: Shows while generating download URL */
                <div className="text-center py-1">
                  <div className="animate-spin text-3xl mb-1">⚙️</div>
                  <p className="text-sm">Generating link...</p>
                </div>
              )}

              {/* Direct download button */}
              <button
                onClick={handleDownload}
                className="btn-secondary w-full text-sm py-2"
                style={{
                  fontFamily: 'sans-serif',
                  background: "#FFB6C1", // Light pink background
                  padding: "12px 80px",
                  borderRadius: 18,
                  boxShadow: "0 8px 20px rgba(246,100,130,0.18)", // Subtle shadow
                  border: "3px solid #FF6B6A", // Coral-pink border
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#D83A4A", // Deep pink text
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textShadow: "2px 2px 2px 5pxrgba(216, 58, 74, 0.7)"
                }}
              >
                💾 Download Composite
              </button>
            </div>
          </div>
        </div>

        {/* Start over button: Allows new photo session */}
        <div className="text-center mt-1">
          <button
            onClick={handleStartOver}
            className="text-md py-3 px-5 mb-3 rounded-lg bg-rose-300 font-bold hover:bg-rose-400"

            style={{
              fontFamily: 'sans-serif',
              background: "#FFB6C1", // Light pink background
              padding: "12px 40px",
              borderRadius: 18,
              boxShadow: "0 8px 20px rgba(246,100,130,0.18)", // Subtle shadow
              border: "3px solid #FF6B6A", // Coral-pink border
              fontSize: 20,
              fontWeight: 800,
              color: "#D83A4A", // Deep pink text
              cursor: "pointer",
              transition: "all 0.3s ease",
              textShadow: "2px 2px 2px 5pxrgba(216, 58, 74, 0.7)"
            }}
          >
            Another 📸
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareScreen;