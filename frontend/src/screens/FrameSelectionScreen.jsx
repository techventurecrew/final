import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadFrames, applyFrameToComposite, applyFrameToStripGrid, getFramePreview } from '../utils/frameEngine';
import { extractStripFromComposite } from '../utils/imageComposite';

function FrameSelectionScreen({ sessionData, updateSession }) {
    const navigate = useNavigate();
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [frames, setFrames] = useState([]);
    const [framePreviews, setFramePreviews] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const compositeImage = sessionData?.compositeImage;
    const canvasRef = useRef(null);

    // Load frames automatically on component mount
    useEffect(() => {
        const loadFrameOptions = async () => {
            try {
                const loadedFrames = await loadFrames();
                
                // Add "No Frame" option at the beginning
                const framesWithNone = [
                    { id: 'none', name: 'No Frame', src: null, isNone: true },
                    ...loadedFrames
                ];
                
                setFrames(framesWithNone);
                
                // Load previews for all frames (skip "none")
                const previews = {};
                for (const frame of loadedFrames) {
                    try {
                        const preview = await getFramePreview(frame.src);
                        previews[frame.id] = preview;
                    } catch (error) {
                        console.error(`Error loading preview for ${frame.id}:`, error);
                        previews[frame.id] = frame.src; // Fallback to original
                    }
                }
                setFramePreviews(previews);
            } catch (error) {
                console.error('Error loading frames:', error);
            }
        };
        
        loadFrameOptions();
    }, []);

    // Update preview when frame is selected
    useEffect(() => {
        if (selectedFrame && compositeImage) {
            const generatePreview = async () => {
                try {
                    // Check if this is a strip-grid
                    const grid = sessionData?.selectedGrid;
                    const isStripGrid = grid && (grid.id === 'strip-grid' || grid.isStripGrid);
                    
                    let preview;
                    if (isStripGrid) {
                        if (selectedFrame.isNone) {
                            // No frame: extract and show only the left 2×6 strip
                            preview = await extractStripFromComposite(compositeImage, 300);
                        } else {
                            // Apply frame only to the 2×6 strip, then duplicate
                            const framedComposite = await applyFrameToStripGrid(
                                compositeImage,
                                selectedFrame.src,
                                300
                            );
                            // Extract the left strip for display
                            preview = await extractStripFromComposite(framedComposite, 300);
                        }
                    } else {
                        // For other grids, show full composite
                        if (selectedFrame.isNone) {
                            preview = compositeImage;
                        } else {
                            preview = await applyFrameToComposite(
                                compositeImage,
                                selectedFrame.src,
                                { mode: 'composite-size', alignment: 'center' }
                            );
                        }
                    }
                    setPreviewImage(preview);
                } catch (error) {
                    console.error('Error generating preview:', error);
                    setPreviewImage(null);
                }
            };
            
            generatePreview();
        } else {
            setPreviewImage(null);
        }
    }, [selectedFrame, compositeImage, sessionData?.selectedGrid]);


    const handleFrameSelect = (frame) => {
        setSelectedFrame(frame);
    };

    const handleContinue = async () => {
        if (!selectedFrame || !compositeImage) return;

        setIsProcessing(true);

        try {
            let framedImage;
            
            // If "No Frame" is selected, use original composite
            if (selectedFrame.isNone) {
                framedImage = compositeImage;
            } else {
                // Check if this is a strip-grid
                const grid = sessionData?.selectedGrid;
                const isStripGrid = grid && (grid.id === 'strip-grid' || grid.isStripGrid);
                
                if (isStripGrid) {
                    // Apply frame only to the 2×6 strip, then duplicate
                    framedImage = await applyFrameToStripGrid(
                        compositeImage,
                        selectedFrame.src,
                        300
                    );
                } else {
                    // Apply frame to entire composite for other grids
                    framedImage = await applyFrameToComposite(
                        compositeImage,
                        selectedFrame.src,
                        { mode: 'composite-size', alignment: 'center' }
                    );
                }
            }

            updateSession({
                selectedFrame: selectedFrame,
                compositeImage: framedImage,
                originalCompositeImage: compositeImage
            });

            navigate('/stickers');
        } catch (error) {
            console.error('Error applying frame:', error);
            setIsProcessing(false);
        }
    };

    if (!compositeImage) {
        navigate('/camera-settings');
        return null;
    }

    return (
        <div style={{
            background: "#f6DDD8",
            minHeight: "100vh",
            display: "flex",
            gap: '8px',
            padding: '8px'
        }}>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Preview Section */}
            <div className="lg:w-1/3 flex-shrink-0" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{
                    background: "#FFFFFF",
                    border: "3px solid #FF6B6A",
                    borderRadius: "10px",
                    padding: "10px",
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    <div style={{
                        background: "#f0f0f0",
                        borderRadius: "8px",
                        padding: "12px",
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'auto'
                    }}>
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Frame Preview"
                                style={{ 
                                    display: 'block', 
                                    width: '100%', 
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        ) : selectedFrame ? (
                            <div className="text-center text-gray-500">
                                <p className="text-base font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>Generating preview...</p>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <p className="text-base font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>👆 Select a frame to preview</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => navigate('/edit')}
                            className="flex-1 text-sm py-2 px-3 rounded-lg border-2 hover:bg-gray-100 font-semibold"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                            disabled={isProcessing}
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleContinue}
                            style={{
                                background: selectedFrame && !isProcessing ? "#FF6B6A" : "#cccccc",
                                color: "white",
                                fontFamily: "'Poppins', sans-serif"
                            }}
                            className="flex-1 text-sm py-2 px-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                            disabled={!selectedFrame || isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Continue →'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Frame Options Grid */}
            <div className="lg:w-2/3 flex-1 flex flex-col overflow-hidden" style={{ height: '100vh', background: "#f7f4E8", borderRadius: "10px", border: "5px solid #FF6B6A", padding: '12px' }}>
                <h3 className="text-lg font-bold mb-3 text-gray-900 text-center flex-shrink-0" style={{ fontFamily: "'Quicksand', sans-serif", color: '#6B2D9B', fontSize: 28 }}>
                    Frame Options
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-auto flex-1" style={{ overflowY: 'auto' }}>
                    {frames.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 p-8">
                            <p className="text-base font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                Loading frames...
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                                Add PNG frame files to src/frames/ to see them here
                            </p>
                        </div>
                    ) : (
                        frames.map((frame) => (
                            <div
                                key={frame.id}
                                onClick={() => handleFrameSelect(frame)}
                                style={{
                                    background: "#FFFFFF",
                                    borderRadius: "8px",
                                    padding: "6px",
                                    border: selectedFrame?.id === frame.id ? "3px solid #FF6B6A" : "2px solid #e0e0e0",
                                    transform: selectedFrame?.id === frame.id ? "scale(1.02)" : "scale(1)",
                                    transition: "all 0.2s ease",
                                    cursor: 'pointer'
                                }}
                                className="hover:shadow-lg"
                            >
                                <div style={{
                                    background: "#f5f5f5",
                                    borderRadius: "6px",
                                    padding: "4px",
                                    aspectRatio: "1",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '6px',
                                    overflow: 'hidden'
                                }}>
                                    {frame.isNone ? (
                                        <div className="text-gray-600 text-sm font-semibold">
                                            No Frame
                                        </div>
                                    ) : framePreviews[frame.id] ? (
                                        <img
                                            src={framePreviews[frame.id]}
                                            alt={frame.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-xs">Loading...</div>
                                    )}
                                </div>
                                <p className="text-center font-bold text-xs text-gray-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {frame.name}
                                </p>
                                {selectedFrame?.id === frame.id && (
                                    <p className="text-center text-xs text-rose-500 font-semibold mt-1">✓ Selected</p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default FrameSelectionScreen;