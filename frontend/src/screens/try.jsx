/**
 * EditScreen Component
 * 
 * Photo editing and customization screen where users can:
 * - Apply filters and presets to photos
 * - Adjust brightness, contrast, saturation
 * - Add stickers to photos by clicking on the canvas
 * - Navigate between multiple photos in a grid layout
 * - Generate composite image when all photos are edited
 * 
 * Features:
 * - Canvas-based photo editing with real-time preview
 * - Filter presets (Original, B&W, Vintage, Bright, Soft)
 * - Manual adjustments via sliders
 * - Sticker placement system (emoji stickers)
 * - Photo navigation for multi-photo grids
 * - Automatic composite generation for grid layouts
 * 
 * @param {Object} sessionData - Current session data including captured photos
 * @param {Function} updateSession - Callback to update session data
 * @returns {JSX.Element} Photo editing interface
 */
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGridComposite } from '../utils/imageComposite';

function EditScreen({ sessionData, updateSession }) {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [allEditedPhotos, setAllEditedPhotos] = useState({});
    const [filters, setFilters] = useState({
        brightness: 1,
        contrast: 1,
        saturation: 1,
        grayscale: 0,
        blur: 0,
    });
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [stickers, setStickers] = useState({});

    // Available emoji stickers for users to place on photos
    const stickerOptions = ['❤️', '⭐', '😎', '🎉', '✨', '🌟', '💫', '🎈', '🎊', '👑'];

    // Get photos array: Support both legacy single photo and new multi-photo format
    // This ensures backward compatibility with older session data
    const photos = sessionData.capturedPhotos || (sessionData.capturedPhoto ? [sessionData.capturedPhoto] : []);
    // Current photo being edited
    const currentPhoto = photos[currentPhotoIndex];
    // Stickers placed on the current photo
    const currentStickers = stickers[currentPhotoIndex] || [];

    // Redraw canvas whenever current photo, filters, or stickers change
    useEffect(() => {
        // Redirect to camera settings if no photos are available
        if (!photos || photos.length === 0) {
            navigate('/camera-settings');
            return;
        }
        // Redraw canvas with updated photo, filters, and stickers
        drawCanvas();
    }, [currentPhoto, filters, currentStickers]);

    /**
     * Draw photo to canvas with applied filters and stickers
     * This function:
     * - Loads the current photo image
     * - Applies filter effects (brightness, contrast, saturation, grayscale, blur)
     * - Renders the image to canvas
     * - Draws stickers on top of the image
     */
    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = currentPhoto;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.filter = `
        brightness(${filters.brightness})
        contrast(${filters.contrast})
        saturate(${filters.saturation})
        grayscale(${filters.grayscale})
        blur(${filters.blur}px)
      `;

            ctx.drawImage(img, 0, 0);

            ctx.filter = 'none';

            currentStickers.forEach(sticker => {
                ctx.font = `${sticker.size}px Arial`;
                ctx.fillText(sticker.emoji, sticker.x, sticker.y);
            });
        };
    };

    /**
     * Handle canvas click: Places selected sticker at click position
     * Calculates the correct position accounting for canvas scaling
     * 
     * @param {MouseEvent} e - Click event from canvas
     */
    const handleCanvasClick = (e) => {
        // Ignore clicks if no sticker is selected
        if (!selectedSticker) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        // Calculate scaling factors between displayed size and actual canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        // Convert click position to canvas coordinates
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Add new sticker at clicked position
        const newStickers = [...currentStickers, {
            emoji: selectedSticker,
            x: x,
            y: y,
            size: 60, // Fixed sticker size in pixels
        }];

        // Update stickers state for current photo
        setStickers({ ...stickers, [currentPhotoIndex]: newStickers });
    };

    /**
     * Apply filter preset: Quick filter application
     * Presets provide instant filter combinations for common styles
     * 
     * @param {string} preset - Preset name (original, blackWhite, vintage, bright, soft)
     */
    const applyPreset = (preset) => {
        // Filter presets with predefined values for each style
        const presets = {
            original: { brightness: 1, contrast: 1, saturation: 1, grayscale: 0, blur: 0 }, // No filters
            blackWhite: { brightness: 1, contrast: 1.2, saturation: 0, grayscale: 1, blur: 0 }, // Monochrome
            vintage: { brightness: 1.1, contrast: 0.9, saturation: 0.8, grayscale: 0.3, blur: 0 }, // Aged look
            bright: { brightness: 1.3, contrast: 1.1, saturation: 1.2, grayscale: 0, blur: 0 }, // Vibrant colors
            soft: { brightness: 1.1, contrast: 0.9, saturation: 0.9, grayscale: 0, blur: 1 }, // Soft focus
        };
        setFilters(presets[preset]);
    };

    /**
     * Save current edited photo to edited photos collection
     * Converts canvas to JPEG data URL for storage
     */
    const saveCurrentPhoto = () => {
        const canvas = canvasRef.current;
        // Export canvas as JPEG with 95% quality
        const editedPhoto = canvas.toDataURL('image/jpeg', 0.95);
        // Store in edited photos map by photo index
        setAllEditedPhotos({ ...allEditedPhotos, [currentPhotoIndex]: editedPhoto });
    };

    const handleNext = async () => {
        // Save current photo before generating composite
        const canvas = canvasRef.current;
        const currentEditedPhoto = canvas ? canvas.toDataURL('image/jpeg', 0.95) : null;
        const updatedEditedPhotos = { ...allEditedPhotos };
        if (currentEditedPhoto) {
            updatedEditedPhotos[currentPhotoIndex] = currentEditedPhoto;
        }

        // Save all edited photos - use saved versions or original photos
        const finalPhotos = photos.map((_, idx) => {
            if (updatedEditedPhotos[idx]) return updatedEditedPhotos[idx];
            // If no edited version, use original photo
            return photos[idx];
        });

        // Get grid layout from session data
        const grid = sessionData.selectedGrid || { cols: 1, rows: 1, id: '4x6-single' };
        const isStripGrid = grid.id === 'strip-grid' || grid.isStripGrid;
        const totalCells = isStripGrid ? 4 : (grid.cols * grid.rows);

        // If multiple photos and grid layout, create composite image
        let compositeImage = null;
        // Handle strip-grid: create composite from 4 photos
        if (isStripGrid && finalPhotos.length === 4) {
            try {
                compositeImage = await createGridComposite(finalPhotos, grid, 300);
                console.log('Strip-grid composite image created successfully');
            } catch (error) {
                console.error('Error creating strip-grid composite:', error);
                compositeImage = finalPhotos[0];
            }
        } else if (finalPhotos.length > 1 && totalCells > 1 && finalPhotos.length === totalCells) {
            try {
                compositeImage = await createGridComposite(finalPhotos, grid, 300);
                console.log('Composite image created successfully');
            } catch (error) {
                console.error('Error creating composite:', error);
                // Continue without composite if error occurs
            }
        } else if (finalPhotos.length === 1) {
            // Single photo - use it as the composite
            compositeImage = finalPhotos[0];
        }

        // Save both individual photos (for editing/display) and composite (for print/download)
        updateSession({
            editedPhotos: finalPhotos,
            compositeImage: compositeImage || finalPhotos[0] // Fallback to first photo if no composite
        });
        navigate('/share');
    };

    const handlePreviousPhoto = () => {
        saveCurrentPhoto();
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(currentPhotoIndex - 1);
            // Load saved filters for this photo if they exist
            setFilters({ brightness: 1, contrast: 1, saturation: 1, grayscale: 0, blur: 0 });
        }
    };

    const handleNextPhoto = () => {
        saveCurrentPhoto();
        if (currentPhotoIndex < photos.length - 1) {
            setCurrentPhotoIndex(currentPhotoIndex + 1);
            // Load saved filters for this photo if they exist
            setFilters({ brightness: 1, contrast: 1, saturation: 1, grayscale: 0, blur: 0 });
        }
    };

    const resetStickers = () => {
        setStickers({ ...stickers, [currentPhotoIndex]: [] });
    };

    return (
        <div style={{ background: "#f6DDD8", height: "100vh", overflow: "hidden" }} className=" items-center justify-center ">
            <div className="text-center mb-1">
                <h2 className="text-2xl font-bold text-gray-900">Edit Photo {currentPhotoIndex + 1} of {photos.length}</h2>
                <p className="text-xs text-gray-600">Filters, adjustments, stickers</p>
            </div>
            <div
                style={{
                    height: "90%",
                    background: "#f7f4E8", // Cream white background
                    border: "5px solid #FF6B6A", // Coral-pink border
                    padding: 0,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    borderRadius: "10px"
                }}
                className="max-w-7xl w-full h-full flex flex-col">


                <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden min-h-0 m-3">
                    <div className="col-span-1 min-h-0">
                        <div className="card p-2 h-full flex flex-col">
                            <div className=" rounded-xl overflow-hidden flex-1 min-h-0">
                                <canvas
                                    ref={canvasRef}
                                    onClick={handleCanvasClick}
                                    className="w-full h-full cursor-crosshair"
                                />
                            </div>

                            <div className="mt-1 flex justify-center gap-1">
                                <button
                                    onClick={() => navigate('/camera-settings')}
                                    className="text-xs py-1 px-2 rounded-lg border-2 hover:bg-gray-100"
                                >
                                    ← Back
                                </button>
                                {photos.length > 1 && currentPhotoIndex > 0 && (
                                    <button
                                        onClick={handlePreviousPhoto}
                                        className="text-xs py-1 px-2 rounded-lg border-2 hover:bg-gray-100"
                                    >
                                        Prev
                                    </button>
                                )}
                                {photos.length > 1 && currentPhotoIndex < photos.length - 1 && (
                                    <button
                                        onClick={handleNextPhoto}
                                        className="text-xs py-1 px-2 rounded-lg bg-gray-300 font-bold hover:bg-gray-400"
                                    >
                                        Next
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="text-xs py-1 px-2 rounded-lg bg-rose-300 font-bold hover:bg-rose-400"
                                >
                                    {photos.length > 1 ? `Done (${currentPhotoIndex + 1}/${photos.length})` : 'Next'} →
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 h-full overflow-y-auto min-h-0">
                        <div className="card h-full space-y-2 p-3">
                            <div>
                                <h3 className="text-md font-bold mb-1">Presets</h3>
                                <div className="grid grid-cols-2 gap-1 py-3">
                                    {['original', 'blackWhite', 'vintage', 'bright', 'soft'].map(preset => (
                                        <button
                                            key={preset}
                                            onClick={() => applyPreset(preset)}
                                            className="p-1 border-2 border-gray-200 rounded text-xs font-semibold capitalize hover:border-primary-500"
                                        >
                                            {preset === 'blackWhite' ? 'B&W' : preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-md font-bold mb-1">Adjustments</h3>
                                <div className="space-y-1 text-xs">
                                    <div>
                                        <label className="block font-semibold text-sm">Bright</label>
                                        <input type="range" min="0.5" max="2" step="0.1" value={filters.brightness} onChange={(e) => setFilters({ ...filters, brightness: parseFloat(e.target.value) })} className="w-full h-2" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-sm">Contrast</label>
                                        <input type="range" min="0.5" max="2" step="0.1" value={filters.contrast} onChange={(e) => setFilters({ ...filters, contrast: parseFloat(e.target.value) })} className="w-full h-2" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-sm">Satur</label>
                                        <input type="range" min="0" max="2" step="0.1" value={filters.saturation} onChange={(e) => setFilters({ ...filters, saturation: parseFloat(e.target.value) })} className="w-full h-2" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-md font-bold">Stickers</h3>
                                    <button onClick={resetStickers} className="text-md bg-red-500 text-white font-bold px-5 py-1.5 rounded hover:bg-red-600">Clear</button>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Click sticker, then photo</p>
                                <div className="grid grid-cols-5 gap-1">
                                    {stickerOptions.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setSelectedSticker(emoji)}
                                            className={`p-1 text-lg border-2 rounded transition-all ${selectedSticker === emoji
                                                ? 'border-primary-500 bg-primary-50 scale-110'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditScreen;