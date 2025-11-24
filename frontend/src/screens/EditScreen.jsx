import React, { useRef, useEffect, useState } from 'react';
import { FallingHearts } from '../components/Decoration';
import { useNavigate } from 'react-router-dom';
import { createGridComposite } from '../utils/imageComposite';

function EditScreen({ sessionData, updateSession }) {
  const navigate = useNavigate();
  const containerRefs = useRef({});
  const [allFilters, setAllFilters] = useState({});
  const [allStickers, setAllStickers] = useState({});
  const [draggedSticker, setDraggedSticker] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [selectedStickerIndex, setSelectedStickerIndex] = useState(null);

  const stickerOptions = [
    { id: 1, src: '❤️', type: 'emoji' },
    { id: 2, src: '⭐', type: 'emoji' },
    { id: 3, src: '😎', type: 'emoji' },
    { id: 4, src: '🎉', type: 'emoji' },
    { id: 5, src: '✨', type: 'emoji' },
    { id: 6, src: '🌟', type: 'emoji' },
    { id: 7, src: '💫', type: 'emoji' },
    { id: 8, src: '🎈', type: 'emoji' },
    { id: 9, src: '🎊', type: 'emoji' },
    { id: 10, src: '👑', type: 'emoji' },
  ];

  const photos = sessionData?.capturedPhotos || (sessionData?.capturedPhoto ? [sessionData.capturedPhoto] : []);

  useEffect(() => {
    if (!photos || photos.length === 0) {
      navigate('/camera-settings');
      return;
    }
  }, [photos, navigate]);

  const getFilters = (index) => allFilters[index] || {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    grayscale: 0,
    blur: 0,
  };

  const getStickers = (index) => allStickers[index] || [];

  const handleDragStart = (e, sticker) => {
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedSticker(sticker);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e, photoIndex) => {
    e.preventDefault();
    if (!draggedSticker) return;

    const container = containerRefs.current[photoIndex];
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSticker = {
      ...draggedSticker,
      x: x,
      y: y,
      size: 80,
      rotation: 0,
      id: Date.now(),
    };

    const currentStickers = getStickers(photoIndex);
    const newStickers = [...currentStickers, newSticker];
    setAllStickers({ ...allStickers, [photoIndex]: newStickers });
    setDraggedSticker(null);
    setSelectedPhotoIndex(photoIndex);
    setSelectedStickerIndex(newStickers.length - 1);
  };

  const handleStickerDragStart = (e, photoIndex, stickerIndex) => {
    e.stopPropagation();
    setSelectedPhotoIndex(photoIndex);
    setSelectedStickerIndex(stickerIndex);
  };

  const handleStickerDrag = (e, photoIndex, stickerIndex) => {
    if (e.clientX === 0 && e.clientY === 0) return;

    const container = containerRefs.current[photoIndex];
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentStickers = getStickers(photoIndex);
    const updatedStickers = [...currentStickers];
    updatedStickers[stickerIndex] = {
      ...updatedStickers[stickerIndex],
      x: x,
      y: y,
    };
    setAllStickers({ ...allStickers, [photoIndex]: updatedStickers });
  };

  const deleteSticker = (photoIndex, stickerIndex) => {
    const currentStickers = getStickers(photoIndex);
    const updatedStickers = currentStickers.filter((_, i) => i !== stickerIndex);
    setAllStickers({ ...allStickers, [photoIndex]: updatedStickers });
    setSelectedStickerIndex(null);
  };

  const resizeSticker = (photoIndex, stickerIndex, delta) => {
    const currentStickers = getStickers(photoIndex);
    const updatedStickers = [...currentStickers];
    updatedStickers[stickerIndex] = {
      ...updatedStickers[stickerIndex],
      size: Math.max(40, Math.min(200, updatedStickers[stickerIndex].size + delta)),
    };
    setAllStickers({ ...allStickers, [photoIndex]: updatedStickers });
  };

  const rotateSticker = (photoIndex, stickerIndex, delta) => {
    const currentStickers = getStickers(photoIndex);
    const updatedStickers = [...currentStickers];
    updatedStickers[stickerIndex] = {
      ...updatedStickers[stickerIndex],
      rotation: (updatedStickers[stickerIndex].rotation + delta) % 360,
    };
    setAllStickers({ ...allStickers, [photoIndex]: updatedStickers });
  };

  const applyPreset = (photoIndex, preset) => {
    const presets = {
      original: { brightness: 1, contrast: 1, saturation: 1, grayscale: 0, blur: 0 },
      blackWhite: { brightness: 1, contrast: 1.2, saturation: 0, grayscale: 1, blur: 0 },
      vintage: { brightness: 1.1, contrast: 0.9, saturation: 0.8, grayscale: 0.3, blur: 0 },
      bright: { brightness: 1.3, contrast: 1.1, saturation: 1.2, grayscale: 0, blur: 0 },
      soft: { brightness: 1.1, contrast: 0.9, saturation: 0.9, grayscale: 0, blur: 1 },
    };
    setAllFilters({ ...allFilters, [photoIndex]: presets[preset] });
  };

  const getImageStyle = (index) => {
    const filters = getFilters(index);
    return {
      filter: `
        brightness(${filters.brightness})
        contrast(${filters.contrast})
        saturate(${filters.saturation})
        grayscale(${filters.grayscale})
        blur(${filters.blur}px)
      `,
    };
  };

  const saveCurrentPhoto = async (photoIndex) => {
    const container = containerRefs.current[photoIndex];
    if (!container) return null;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const img = new Image();
    img.src = photos[photoIndex];

    return new Promise((resolve) => {
      img.onload = () => {
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;

        const filters = getFilters(photoIndex);
        tempCtx.filter = `
          brightness(${filters.brightness})
          contrast(${filters.contrast})
          saturate(${filters.saturation})
          grayscale(${filters.grayscale})
          blur(${filters.blur}px)
        `;

        tempCtx.drawImage(img, 0, 0);
        tempCtx.filter = 'none';

        const stickers = getStickers(photoIndex);
        stickers.forEach(sticker => {
          tempCtx.save();
          tempCtx.translate(sticker.x * (img.width / container.offsetWidth), sticker.y * (img.height / container.offsetHeight));
          tempCtx.rotate((sticker.rotation * Math.PI) / 180);
          tempCtx.font = `${sticker.size}px Arial`;
          tempCtx.textAlign = 'center';
          tempCtx.textBaseline = 'middle';
          tempCtx.fillText(sticker.src, 0, 0);
          tempCtx.restore();
        });

        const editedPhoto = tempCanvas.toDataURL('image/jpeg', 0.95);
        resolve(editedPhoto);
      };
    });
  };

  const handleNext = async () => {
    const edited = {};

    for (let i = 0; i < photos.length; i++) {
      const saved = await saveCurrentPhoto(i);
      if (saved) edited[i] = saved;
    }

    const finalPhotos = photos.map((_, idx) => {
      if (edited[idx]) return edited[idx];
      return photos[idx];
    });

    const grid = sessionData.selectedGrid || { cols: 1, rows: 1, id: '4x6-single' };
    const isStripGrid = grid.id === 'strip-grid' || grid.isStripGrid;
    const totalCells = isStripGrid ? 4 : (grid.cols * grid.rows);

    let compositeImage = null;
    // Handle strip-grid: create composite from 4 photos
    if (isStripGrid && finalPhotos.length === 4) {
      try {
        compositeImage = await createGridComposite(finalPhotos, grid, 300, 3);
        console.log('Strip-grid composite image created successfully');
      } catch (error) {
        console.error('Error creating strip-grid composite:', error);
        compositeImage = finalPhotos[0];
      }
    } else if (finalPhotos.length > 1 && totalCells > 1 && finalPhotos.length === totalCells) {
      try {
        compositeImage = await createGridComposite(finalPhotos, grid, 300, 3);
        console.log('Composite image created successfully');
      } catch (error) {
        console.error('Error creating composite:', error);
      }
    } else if (finalPhotos.length === 1) {
      compositeImage = finalPhotos[0];
    }

    updateSession({
      editedPhotos: finalPhotos,
      compositeImage: compositeImage || finalPhotos[0],
      selectedGrid: grid
    });

    navigate('/frame-selection');
  };

  const resetStickers = (photoIndex) => {
    setAllStickers({ ...allStickers, [photoIndex]: [] });
    setSelectedStickerIndex(null);
  };

  return (
    <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className="items-center justify-center">
      <FallingHearts />
      <div className="text-center mb-1 pt-2">
        <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif", color: '#6B2D9B', fontSize: 28 }}>Edit Photos</h2>
        <p className="text-xs text-gray-600">Click on a photo to edit, drag stickers, apply presets</p>
      </div>
      <div
        style={{
          height: "90%",
          background: "#f7f4E8",
          border: "5px solid #FF6B6A",
          padding: 0,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          borderRadius: "10px"
        }}
        className="max-w-7xl mx-auto w-full h-full flex flex-col">

        <div className="grid grid-cols-3 gap-2 flex-1 overflow-hidden min-h-0 m-3">
          {/* Left - Photos Grid */}
          <div className="col-span-2 min-h-0">
            <div className="card p-3 h-full flex flex-col">
              <p className="text-xs font-semibold text-gray-700 mb-2">Photos Grid - Click to Edit</p>
              <div className="grid grid-cols-2 gap-3 flex-1 overflow-auto min-h-0">
                {photos.map((photo, photoIndex) => (
                  <div key={photoIndex} className="flex flex-col gap-2">
                    <div
                      ref={(el) => {
                        if (el) containerRefs.current[photoIndex] = el;
                      }}
                      onClick={() => setSelectedPhotoIndex(photoIndex)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, photoIndex)}
                      className={`rounded-lg overflow-hidden cursor-pointer border-3 transition-all relative flex-1 bg-white ${selectedPhotoIndex === photoIndex
                        ? 'border-rose-400 shadow-lg'
                        : 'border-gray-300 hover:border-rose-300'
                        }`}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${photoIndex + 1}`}
                        style={getImageStyle(photoIndex)}
                        className="w-full h-full object-cover"
                      />
                      {getStickers(photoIndex).map((sticker, stickerIndex) => (
                        <div
                          key={sticker.id}
                          draggable
                          onDragStart={(e) => handleStickerDragStart(e, photoIndex, stickerIndex)}
                          onDrag={(e) => handleStickerDrag(e, photoIndex, stickerIndex)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhotoIndex(photoIndex);
                            setSelectedStickerIndex(stickerIndex);
                          }}
                          style={{
                            position: 'absolute',
                            left: `${sticker.x}px`,
                            top: `${sticker.y}px`,
                            transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                            fontSize: `${sticker.size}px`,
                            cursor: 'move',
                            userSelect: 'none',
                            zIndex: selectedPhotoIndex === photoIndex && selectedStickerIndex === stickerIndex ? 20 : 10,
                          }}
                          className={`${selectedPhotoIndex === photoIndex && selectedStickerIndex === stickerIndex ? 'ring-2 ring-blue-500 rounded-full' : ''}`}
                        >
                          {sticker.src}
                        </div>
                      ))}
                    </div>
                    {selectedPhotoIndex === photoIndex && (
                      <div className="flex gap-1 text-xs">
                        <button
                          onClick={() => applyPreset(photoIndex, 'original')}
                          className="flex-1 py-1 px-2 border border-gray-300 rounded hover:border-rose-400 text-xs font-semibold"
                        >
                          Original
                        </button>
                        <button
                          onClick={() => applyPreset(photoIndex, 'blackWhite')}
                          className="flex-1 py-1 px-2 border border-gray-300 rounded hover:border-rose-400 text-xs font-semibold"
                        >
                          B&W
                        </button>
                        <button
                          onClick={() => applyPreset(photoIndex, 'vintage')}
                          className="flex-1 py-1 px-2 border border-gray-300 rounded hover:border-rose-400 text-xs font-semibold"
                        >
                          Vintage
                        </button>
                        <button
                          onClick={() => applyPreset(photoIndex, 'bright')}
                          className="flex-1 py-1 px-2 border border-gray-300 rounded hover:border-rose-400 text-xs font-semibold"
                        >
                          Bright
                        </button>
                        <button
                          onClick={() => applyPreset(photoIndex, 'soft')}
                          className="flex-1 py-1 px-2 border border-gray-300 rounded hover:border-rose-400 text-xs font-semibold"
                        >
                          Soft
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-center gap-2">
                <button
                  onClick={() => navigate('/camera-settings')}
                  className="text-xs w-[50%] py-2 px-3 rounded-lg border-2 hover:bg-gray-100 font-semibold"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  className="text-xs w[50%] py-2 px-3 rounded-lg bg-rose-300 font-bold hover:bg-rose-400 flex-1"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Right - Stickers Panel */}
          <div className="col-span-1 h-full overflow-y-auto min-h-0">
            <div className="card h-full space-y-3 p-3">
              <div>
                <h3 className="text-sm font-bold mb-2">Stickers</h3>
                <p className="text-xs text-gray-600 mb-2">Drag stickers onto any photo</p>
                <div className="grid grid-cols-5 gap-2">
                  {stickerOptions.map(sticker => (
                    <div
                      key={sticker.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, sticker)}
                      className="p-2 text-2xl border-2 rounded cursor-move transition-all hover:border-rose-400 hover:scale-110 bg-white flex items-center justify-center"
                    >
                      {sticker.src}
                    </div>
                  ))}
                </div>
              </div>

              {selectedPhotoIndex !== null && selectedStickerIndex !== null && (
                <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
                  <p className="text-xs font-bold mb-3 text-gray-800">Edit Sticker</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border">
                      <button
                        onClick={() => resizeSticker(selectedPhotoIndex, selectedStickerIndex, -10)}
                        className="px-3 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 text-sm"
                      >
                        −
                      </button>
                      <span className="text-xs font-semibold flex-1 text-center">Size</span>
                      <button
                        onClick={() => resizeSticker(selectedPhotoIndex, selectedStickerIndex, 10)}
                        className="px-3 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 text-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border">
                      <button
                        onClick={() => rotateSticker(selectedPhotoIndex, selectedStickerIndex, -15)}
                        className="px-3 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600 text-sm"
                      >
                        ↺
                      </button>
                      <span className="text-xs font-semibold flex-1 text-center">Rotate</span>
                      <button
                        onClick={() => rotateSticker(selectedPhotoIndex, selectedStickerIndex, 15)}
                        className="px-3 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600 text-sm"
                      >
                        ↻
                      </button>
                    </div>

                    <button
                      onClick={() => deleteSticker(selectedPhotoIndex, selectedStickerIndex)}
                      className="w-full px-3 py-2 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600 border-2 border-red-700"
                    >
                      🗑 Delete Sticker
                    </button>
                  </div>
                </div>
              )}

              {selectedPhotoIndex !== null && (
                <button
                  onClick={() => resetStickers(selectedPhotoIndex)}
                  className="w-full text-xs bg-orange-500 text-white font-bold px-3 py-2 rounded hover:bg-orange-600"
                >
                  Clear All Stickers
                </button>
              )}
            </div>
          </div>
        </div>
        <img
          src="/images/teddy_left.png"
          alt="teddy bear with camera"
          className="absolute"
          style={{ left: 20, bottom: 10, width: 120, height: 'auto', zIndex: 1 }}
        />
      </div>
    </div>
  );
}

export default EditScreen;