import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FallingSparkles, FloatingBubbles, FallingHearts, ConfettiRain, TwinklingStars } from '../components/Decoration';
import { extractStripFromComposite } from '../utils/imageComposite';

function StickerEditorScreen({ sessionData, updateSession }) {
    const navigate = useNavigate();
    const [stickers, setStickers] = useState([]);
    const [selectedStickerId, setSelectedStickerId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const compositeImage = sessionData?.compositeImage;
    const canvasRef = useRef(null);
    const imageContainerRef = useRef(null);
    const imageRef = useRef(null);
    // Display image (extract strip for strip-grid, otherwise use full composite)
    const [displayImage, setDisplayImage] = useState(compositeImage);

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
            setDisplayImage(compositeImage);
        }
    }, [compositeImage, sessionData?.selectedGrid]);

    // Sticker library - replace these URLs with your actual sticker image paths
    const stickerLibrary = [
        {
            id: 'heart', url: '/images/stick1.png', name: 'Heart'
        },
        { id: 'star', url: '/images/stick2.png', name: 'Star' },
        { id: 'smile', url: '/images/stick3.png', name: 'Smile' },
        { id: 'flower', url: '/images/stick4.png', name: 'Flower' },
        { id: 'balloon', url: '/images/stick5.png', name: 'Balloon' },
        { id: 'confetti', url: '/images/stick6.png', name: 'Confetti' },
        { id: 'butterfly', url: '/images/stick7.png', name: 'Butterfly' },
        { id: 'music', url: '/images/stick8.png', name: 'Music' },
        { id: 'crown', url: '/images/stick9.png', name: 'Crown' },
        { id: 'sparkle', url: '/images/stick10.png', name: 'Sparkle' },
        { id: 'peace', url: '/images/stick11.png', name: 'Peace' },
        { id: 'rainbow', url: '/images/stick12.png', name: 'Rainbow' },
        { id: 'music', url: '/images/stick13.png', name: 'Music' },
        { id: 'crown', url: '/images/stick14.png', name: 'Crown' },
        { id: 'sparkle', url: '/images/stick15.png', name: 'Sparkle' },
        { id: 'peace', url: '/images/stick16.png', name: 'Peace' },
        { id: 'rainbow', url: '/images/stick17.png', name: 'Rainbow' }
    ];

    const addSticker = (stickerData) => {
        const newSticker = {
            id: `sticker-${Date.now()}-${Math.random()}`,
            url: stickerData.url,
            x: 150,
            y: 150,
            width: 80,
            height: 80,
            rotation: 0,
            scale: 1
        };
        setStickers([...stickers, newSticker]);
        setSelectedStickerId(newSticker.id);
    };

    const deleteSticker = (stickerId) => {
        setStickers(stickers.filter(s => s.id !== stickerId));
        if (selectedStickerId === stickerId) {
            setSelectedStickerId(null);
        }
    };

    const handleStickerClick = (e, stickerId) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedStickerId(stickerId);
    };

    const handleStickerMouseDown = (e, stickerId) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedStickerId(stickerId);

        const sticker = stickers.find(s => s.id === stickerId);
        const startX = e.clientX || e.touches?.[0]?.clientX;
        const startY = e.clientY || e.touches?.[0]?.clientY;
        const startStickerX = sticker.x;
        const startStickerY = sticker.y;

        let hasMoved = false;

        const handleMouseMove = (moveEvent) => {
            const currentX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
            const currentY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            // Consider it a drag if moved more than 3 pixels
            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                hasMoved = true;
            }

            setStickers(prev => prev.map(s =>
                s.id === stickerId
                    ? { ...s, x: startStickerX + deltaX, y: startStickerY + deltaY }
                    : s
            ));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleMouseMove);
        document.addEventListener('touchend', handleMouseUp);
    };

    const updateStickerSize = (stickerId, delta) => {
        setStickers(prev => prev.map(s =>
            s.id === stickerId
                ? {
                    ...s,
                    scale: Math.max(0.3, Math.min(3, s.scale + delta)),
                    width: s.width * (1 + delta),
                    height: s.height * (1 + delta)
                }
                : s
        ));
    };

    const updateStickerRotation = (stickerId, delta) => {
        setStickers(prev => prev.map(s =>
            s.id === stickerId
                ? { ...s, rotation: (s.rotation + delta) % 360 }
                : s
        ));
    };

    const mergeStickersWithImage = async () => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                // Draw base image
                ctx.drawImage(img, 0, 0);

                // Check if this is a strip-grid
                const grid = sessionData?.selectedGrid;
                const isStripGrid = grid && (grid.id === 'strip-grid' || grid.isStripGrid);

                // Get the actual displayed image dimensions and position
                const displayImg = imageRef.current;
                const container = imageContainerRef.current;

                // Calculate the actual image dimensions as displayed
                const displayedWidth = displayImg.offsetWidth;
                const displayedHeight = displayImg.offsetHeight;

                // Calculate the offset of the image within the container (due to centering)
                const imgOffsetX = (container.offsetWidth - displayedWidth) / 2;
                const imgOffsetY = (container.offsetHeight - displayedHeight) / 2;

                // For strip-grid, the displayed image is the left strip (half width)
                // So we need to scale X coordinate differently
                let scaleX, scaleY;
                if (isStripGrid) {
                    // Displayed image is 600px wide (strip), actual composite is 1200px wide
                    // But stickers are positioned on the strip, so we keep X scale at 1
                    // and Y scale is normal
                    scaleX = 1; // Don't scale X - stickers are already positioned correctly for the left strip
                    scaleY = img.height / displayedHeight;
                } else {
                    // Normal scaling for other grids
                    scaleX = img.width / displayedWidth;
                    scaleY = img.height / displayedHeight;
                }

                // Draw each sticker
                stickers.forEach(sticker => {
                    const stickerImg = new Image();
                    stickerImg.onload = () => {
                        ctx.save();

                        // Adjust sticker position: subtract offset first, then scale
                        const actualX = (sticker.x - imgOffsetX) * scaleX;
                        const actualY = (sticker.y - imgOffsetY) * scaleY;
                        const actualWidth = sticker.width * scaleX;
                        const actualHeight = sticker.height * scaleY;

                        ctx.translate(actualX + actualWidth / 2, actualY + actualHeight / 2);
                        ctx.rotate((sticker.rotation * Math.PI) / 180);
                        ctx.drawImage(
                            stickerImg,
                            -actualWidth / 2,
                            -actualHeight / 2,
                            actualWidth,
                            actualHeight
                        );
                        ctx.restore();
                    };
                    stickerImg.src = sticker.url;
                });

                // Wait a bit for all stickers to load, then resolve
                setTimeout(() => {
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                }, 500);
            };
            img.src = compositeImage;
        });
    };

    const handleContinue = async () => {
        setIsProcessing(true);

        try {
            let finalImage = compositeImage;

            // Merge stickers if any exist
            if (stickers.length > 0) {
                finalImage = await mergeStickersWithImage();
            }

            // Update the compositeImage in session (not a separate stickeredImage)
            updateSession({
                compositeImage: finalImage, // This updates the main composite image
                stickers: stickers // Save sticker data for reference
            });

            navigate('/share');
        } catch (error) {
            console.error('Error merging stickers:', error);
            alert('Failed to apply stickers. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleSkip = () => {
        navigate('/share');
    };

    if (!compositeImage) {
        navigate('/frame-selection');
        return null;
    }

    return (
        <div style={{
            background: "#f6DDD8",
            minHeight: "100vh",
            overflowY: "auto"
        }}>
            <FallingHearts />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="text-center pt-2">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "'Quicksand', sans-serif", color: '#6B2D9B', fontSize: 36 }}>Add Stickers</h2>
                <p className="text-sm text-gray-600">Drag and drop stickers to decorate your photo</p>
            </div>

            <div
                style={{
                    background: "#f7f4E8",
                    border: "5px solid #FF6B6A",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    borderRadius: "10px",
                    margin: '8px',
                }}
                className="min-w-7xl p-2"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Editor Section */}
                    <div className="lg:col-span-2">
                        <div
                            style={{
                                background: "#FFFFFF",
                                border: "3px solid #FF6B6A",
                                borderRadius: "10px",
                                padding: "10px"
                            }}
                        >
                            {/* <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Your Photo</h3> */}
                            <div
                                ref={imageContainerRef}
                                style={{
                                    background: "#f0f0f0",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    position: "relative",
                                    minHeight: "400px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                                onClick={() => setSelectedStickerId(null)}
                            >
                                <img
                                    ref={imageRef}
                                    src={displayImage}
                                    alt="Your photo"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "500px",
                                        display: "block"
                                    }}
                                />

                                {/* Render stickers */}
                                {stickers.map((sticker) => (
                                    <div
                                        key={sticker.id}
                                        onClick={(e) => handleStickerClick(e, sticker.id)}
                                        onMouseDown={(e) => handleStickerMouseDown(e, sticker.id)}
                                        onTouchStart={(e) => handleStickerMouseDown(e, sticker.id)}
                                        style={{
                                            position: 'absolute',
                                            left: `${sticker.x}px`,
                                            top: `${sticker.y}px`,
                                            width: `${sticker.width}px`,
                                            height: `${sticker.height}px`,
                                            transform: `rotate(${sticker.rotation}deg)`,
                                            cursor: 'pointer',
                                            border: selectedStickerId === sticker.id ? '3px dashed #FF6B6A' : '2px solid transparent',
                                            padding: '2px',
                                            zIndex: selectedStickerId === sticker.id ? 1000 : 1,
                                            transition: 'border 0.2s ease',
                                            boxShadow: selectedStickerId === sticker.id ? '0 0 10px rgba(255, 107, 106, 0.5)' : 'none'
                                        }}
                                    >
                                        <img
                                            src={sticker.url}
                                            alt="Sticker"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                pointerEvents: 'none',
                                                userSelect: 'none'
                                            }}
                                            draggable={false}
                                        />
                                        {selectedStickerId === sticker.id && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    background: '#FF6B6A',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Sticker Controls */}
                            {selectedStickerId && (
                                <div
                                    style={{
                                        background: "#FFE5EC",
                                        border: "2px solid #FF6B6A",
                                        borderRadius: "8px",
                                        padding: "8px",
                                        marginTop: "8px"
                                    }}
                                >
                                    <p className="text-xs font-bold text-gray-800 mb-2">Sticker Controls</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => updateStickerSize(selectedStickerId, 0.1)}
                                            className="text-xs py-1 px-2 bg-white rounded border border-gray-300 hover:bg-gray-50 font-semibold"
                                        >
                                            Size +
                                        </button>
                                        <button
                                            onClick={() => updateStickerSize(selectedStickerId, -0.1)}
                                            className="text-xs py-1 px-2 bg-white rounded border border-gray-300 hover:bg-gray-50 font-semibold"
                                        >
                                            Size -
                                        </button>
                                        <button
                                            onClick={() => updateStickerRotation(selectedStickerId, 15)}
                                            className="text-xs py-1 px-2 bg-white rounded border border-gray-300 hover:bg-gray-50 font-semibold"
                                        >
                                            Rotate ↻
                                        </button>
                                        <button
                                            onClick={() => updateStickerRotation(selectedStickerId, -15)}
                                            className="text-xs py-1 px-2 bg-white rounded border border-gray-300 hover:bg-gray-50 font-semibold"
                                        >
                                            Rotate ↺
                                        </button>
                                        <button
                                            onClick={() => deleteSticker(selectedStickerId)}
                                            className="text-xs py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600 font-semibold"
                                        >
                                            Delete 🗑️
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => navigate('/frame-selection')}
                                    className="flex-1 text-sm py-2 px-3 rounded-lg border-2 hover:bg-gray-100 font-semibold"
                                    disabled={isProcessing}
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 text-sm py-2 px-3 rounded-lg border-2 border-gray-400 hover:bg-gray-100 font-semibold"
                                    disabled={isProcessing}
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleContinue}
                                    style={{
                                        background: !isProcessing ? "#FF6B6A" : "#cccccc",
                                        color: "white"
                                    }}
                                    className="flex-1 text-sm py-2 px-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 'Continue →'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sticker Library */}
                    <div className="lg:col-span-1">
                        <div
                            style={{
                                background: "#FFFFFF",
                                border: "3px solid #FF6B6A",
                                borderRadius: "10px",
                                padding: "10px"
                            }}
                        >
                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Sticker Library</h3>
                            <div
                                style={{
                                    maxHeight: "500px",
                                    overflowY: "auto"
                                }}
                                className="grid grid-cols-3 gap-2"
                            >
                                {stickerLibrary.map((sticker) => (
                                    <div
                                        key={sticker.id}
                                        onClick={() => addSticker(sticker)}
                                        style={{
                                            background: "#f5f5f5",
                                            borderRadius: "8px",
                                            padding: "8px",
                                            cursor: "pointer",
                                            border: "2px solid #e0e0e0",
                                            transition: "all 0.2s ease"
                                        }}
                                        className="hover:shadow-md hover:border-rose-300"
                                    >
                                        <div
                                            style={{
                                                aspectRatio: "1",
                                                background: "#ffffff",
                                                borderRadius: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: "4px"
                                            }}
                                        >
                                            <img
                                                src={sticker.url}
                                                alt={sticker.name}
                                                style={{
                                                    width: "80%",
                                                    height: "80%",
                                                    objectFit: "contain"
                                                }}
                                            />
                                        </div>
                                        <p className="text-center text-xs font-semibold text-gray-700">{sticker.name}</p>
                                    </div>
                                ))}
                            </div>
                            <div
                                style={{
                                    background: "#FFE5EC",
                                    borderRadius: "8px",
                                    padding: "8px",
                                    marginTop: "8px"
                                }}
                            >
                                <p className="text-xs text-gray-700 text-center">
                                    <strong>Tip:</strong> Click a sticker to add it, then drag to position!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StickerEditorScreen;