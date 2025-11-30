import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';
import './CameraFilter.css'; // Add this import for custom fonts

function CameraFilter({ updateSession }) {
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [previewImage, setPreviewImage] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const apply = () => {
    updateSession({ cameraFilter: filter, brightness });
    navigate('/camera-settings');
  };

  const filterStyles = {
    none: 'none',
    sepia: 'sepia(0.6)',
    vintage: 'sepia(0.4) contrast(0.9) saturate(0.8)',
    cool: 'hue-rotate(200deg) saturate(1.1)',
    mono: 'grayscale(1)',
  };

  // Capture webcam frame periodically for filter previews
  useEffect(() => {
    const captureFrame = () => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          setPreviewImage(imageSrc);
        }
      }
    };

    // Capture initial frame after a short delay to ensure webcam is ready
    const initialTimeout = setTimeout(captureFrame, 500);

    // Update preview every 500ms for live preview effect
    const interval = setInterval(captureFrame, 500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const getCombinedFilter = () => {
    const baseFilter = filterStyles[filter];
    const brightnessFilter = `brightness(${brightness}%)`;
    return baseFilter === 'none' ? brightnessFilter : `${baseFilter} ${brightnessFilter}`;
  };

  return (
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="w-screen h-screen flex items-center justify-center overflow-hidden bg-pink-50">
      <FallingHearts />
      <div className="max-w-6xl w-full h-full bg-white rounded-3xl p-6 border-4 border-rose-200 flex flex-col"
        style={{
          height: "90%",
          background: "#f7f4E8",
          border: "5px solid #FF6B6A",
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h2 className=" font-extrabold text-center mb-2 pt-2" style={{ fontFamily: "'Quicksand', sans-serif", color: '#6B2D9B', fontSize: 40 }}>Camera Color Effects</h2>

        <div className="flex-1 flex gap-4 overflow-hidden px-6">
          {/* Brightness Slider - Left Side */}
          <div className="flex flex-col items-center gap-3 py-4">
            {/* <h3 className="font-semibold text-sm writing-mode-vertical ">Brightness</h3> */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>{brightness}%</span>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(e.target.value)}
                className="brightness-slider"
              // style={{
              //   writingMode: 'bt-lr',
              //   WebkitAppearance: 'slider-vertical',
              //   width: '12px',
              //   height: '300px',
              //   background: '#fff',
              //   borderRadius: '4px',
              //   outline: 'none',
              //   cursor: 'pointer',
              //   // margin: '2px'
              // }}
              />
            </div>
          </div>

          {/* Preview Section - Middle */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* <h3 className="font-semibold text-sm mb-1">Preview</h3> */}
            <div
              style={{
                backgroundColor: "#f6DDD8"
              }}
              className="rounded-lg overflow-hidden  flex-1 flex items-center justify-center">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user', height: { ideal: 1280 }, width: { ideal: 720 } }}
                style={{
                  width: '80%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: getCombinedFilter()
                }}
              />
            </div>

            {/* Buttons centered below preview */}
            <div className="flex justify-center gap-3 mt-4 pb-2">
              <button onClick={() => navigate('/grid')} className="px-6 py-1 rounded-lg border-2 text-sm hover:bg-gray-100" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>Back</button>
              <button onClick={() => navigate('/camera-settings')} className="px-6 py-1 rounded-lg border-2 text-sm hover:bg-gray-100" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>Skip</button>
              <button onClick={apply} className="px-6 py-1 rounded-lg bg-[#FF6B6A] font-bold text-sm hover:bg-rose-600" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Apply</button>
            </div>
          </div>

          {/* Filters Section - Right Side */}
          <div className="w-64 flex flex-col gap-3">
            <h3 className="font-extrabold text-lg text-center" style={{ fontFamily: "'Quicksand', sans-serif" }}>Filters</h3>
            <div className="flex flex-col  gap-3 overflow-x-auto">
              {Object.keys(filterStyles).map(key => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex-shrink-0 p-3 rounded-lg border-2 text-sm font-semibold transition-all ${filter === key ? 'border-rose-500 bg-rose-100' : 'border-gray-200 hover:border-gray-300'}`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <div
                    style={{ 
                      filter: filterStyles[key],
                      backgroundImage: previewImage ? `url(${previewImage})` : 'none',
                      backgroundColor: previewImage ? 'transparent' : '#111827',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    className="w-[100%] h-16 rounded-lg"
                  />
                  <div className="capitalize text-xs">{key}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraFilter;