/**
 * Frame Engine Utility
 * 
 * Automatically discovers and loads PNG frame files from src/frames/
 * Provides canvas-based frame application that merges composite images with frame overlays
 */

/**
 * Dynamically import all PNG files from the frames directory
 * Uses Vite's import.meta.glob for automatic frame discovery
 * 
 * @returns {Promise<Array>} Array of frame objects with { id, name, src, path }
 */
export async function loadFrames() {
  try {
    // Use Vite's import.meta.glob to dynamically import all PNG files
    // Path is relative to src directory
    const frameModules = import.meta.glob('../frames/*.png', { eager: true });
    
    const frames = [];
    
    for (const [path, module] of Object.entries(frameModules)) {
      // Extract filename from path
      const filename = path.split('/').pop().replace('.png', '');
      // Create a clean name from filename (replace underscores/hyphens with spaces, capitalize)
      const name = filename
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      // Get the actual image URL from the module
      const imageSrc = typeof module === 'string' ? module : (module.default || module);
      
      frames.push({
        id: filename,
        name: name,
        src: imageSrc,
        path: path
      });
    }
    
    // Sort frames alphabetically by name
    frames.sort((a, b) => a.name.localeCompare(b.name));
    
    return frames;
  } catch (error) {
    console.error('Error loading frames:', error);
    return [];
  }
}

/**
 * Apply a PNG frame overlay to a composite image using canvas
 * 
 * The frame PNG should be a transparent overlay with cut-out windows for photos.
 * This function:
 * 1. Loads the composite image (which already has photos arranged in grid positions)
 * 2. Loads the selected frame PNG
 * 3. Creates a canvas matching the frame PNG size (or composite size if frame is smaller)
 * 4. Draws the composite image scaled to fit
 * 5. Draws the frame PNG on top, preserving transparency
 * 6. Returns the final merged image as base64
 * 
 * @param {string} compositeImageDataUrl - Base64 data URL of the composite image (photos in grid)
 * @param {string} frameImageSrc - Path or data URL of the frame PNG overlay
 * @param {Object} options - Optional configuration
 * @param {string} options.mode - 'frame-size' (use frame dimensions) or 'composite-size' (use composite dimensions)
 * @param {string} options.alignment - 'center', 'top-left', etc. for composite positioning
 * @returns {Promise<string>} Base64 data URL of the final merged image
 */
export async function applyFrameToComposite(compositeImageDataUrl, frameImageSrc, options = {}) {
  const { mode = 'composite-size', alignment = 'center' } = options;
  
  return new Promise((resolve, reject) => {
    const compositeImg = new Image();
    const frameImg = new Image();
    
    let compositeLoaded = false;
    let frameLoaded = false;
    
    const processImages = () => {
      if (!compositeLoaded || !frameLoaded) return;
      
      try {
        // Determine canvas dimensions based on mode
        let canvasWidth, canvasHeight;
        let compositeX = 0, compositeY = 0;
        let compositeWidth, compositeHeight;
        
        if (mode === 'frame-size') {
          // Use frame dimensions as canvas size
          canvasWidth = frameImg.width;
          canvasHeight = frameImg.height;
          
          // Scale composite to fit within frame while maintaining aspect ratio
          const compositeAspect = compositeImg.width / compositeImg.height;
          const frameAspect = frameImg.width / frameImg.height;
          
          if (compositeAspect > frameAspect) {
            // Composite is wider - fit to width
            compositeWidth = canvasWidth;
            compositeHeight = canvasWidth / compositeAspect;
          } else {
            // Composite is taller - fit to height
            compositeHeight = canvasHeight;
            compositeWidth = canvasHeight * compositeAspect;
          }
          
          // Center composite based on alignment
          if (alignment === 'center') {
            compositeX = (canvasWidth - compositeWidth) / 2;
            compositeY = (canvasHeight - compositeHeight) / 2;
          } else if (alignment === 'top-left') {
            compositeX = 0;
            compositeY = 0;
          } else if (alignment === 'top-center') {
            compositeX = (canvasWidth - compositeWidth) / 2;
            compositeY = 0;
          } else if (alignment === 'center-left') {
            compositeX = 0;
            compositeY = (canvasHeight - compositeHeight) / 2;
          }
        } else {
          // Use composite dimensions as canvas size
          canvasWidth = compositeImg.width;
          canvasHeight = compositeImg.height;
          compositeWidth = canvasWidth;
          compositeHeight = canvasHeight;
          compositeX = 0;
          compositeY = 0;
          
          // Scale frame to match composite size
          // (This mode assumes frame should cover the entire composite)
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        // Fill background with white (in case of transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw composite image (photos in grid positions)
        ctx.drawImage(
          compositeImg,
          compositeX,
          compositeY,
          compositeWidth,
          compositeHeight
        );
        
        // Draw frame PNG overlay on top (preserves transparency)
        if (mode === 'frame-size') {
          // Draw frame at full size
          ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);
        } else {
          // Scale frame to match composite size
          ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);
        }
        
        // Convert to base64 image
        const finalImage = canvas.toDataURL('image/png', 1.0);
        resolve(finalImage);
      } catch (error) {
        console.error('Error applying frame:', error);
        reject(error);
      }
    };
    
    compositeImg.onload = () => {
      compositeLoaded = true;
      processImages();
    };
    
    compositeImg.onerror = () => {
      reject(new Error('Failed to load composite image'));
    };
    
    frameImg.onload = () => {
      frameLoaded = true;
      processImages();
    };
    
    frameImg.onerror = () => {
      reject(new Error('Failed to load frame image'));
    };
    
    // Load images
    compositeImg.src = compositeImageDataUrl;
    frameImg.src = frameImageSrc;
  });
}

/**
 * Apply frame to strip-grid composite
 * Extracts the left 2×6 strip, applies frame to it, then duplicates it side-by-side
 * 
 * @param {string} compositeImageDataUrl - Base64 data URL of the 4×6 composite image
 * @param {string} frameImageSrc - Path or data URL of the frame PNG overlay
 * @param {number} dpi - Print resolution (default 300 DPI)
 * @returns {Promise<string>} Base64 data URL of the final merged image
 */
export async function applyFrameToStripGrid(compositeImageDataUrl, frameImageSrc, dpi = 300) {
  // Strip dimensions: 2 inch width × 6 inch height
  const stripWidthInches = 2;
  const stripHeightInches = 6;
  
  // Final canvas: 4 inch width × 6 inch height
  const canvasWidthInches = 4;
  const canvasHeightInches = 6;
  
  // Convert to pixels at specified DPI
  const stripWidthPx = Math.round(stripWidthInches * dpi); // 600 px
  const stripHeightPx = Math.round(stripHeightInches * dpi); // 1800 px
  const canvasWidthPx = Math.round(canvasWidthInches * dpi); // 1200 px
  const canvasHeightPx = Math.round(canvasHeightInches * dpi); // 1800 px

  return new Promise((resolve, reject) => {
    const compositeImg = new Image();
    const frameImg = new Image();
    
    let compositeLoaded = false;
    let frameLoaded = false;
    
    const processImages = () => {
      if (!compositeLoaded || !frameLoaded) return;
      
      try {
        // Extract the left 2×6 strip from the 4×6 composite
        const stripCanvas = document.createElement('canvas');
        stripCanvas.width = stripWidthPx;
        stripCanvas.height = stripHeightPx;
        const stripCtx = stripCanvas.getContext('2d');
        
        // Draw the left half of the composite (first 600px) onto the strip canvas
        stripCtx.drawImage(
          compositeImg,
          0, 0, stripWidthPx, stripHeightPx,  // source: left half of composite
          0, 0, stripWidthPx, stripHeightPx   // destination: full strip canvas
        );
        
        // Apply frame to the strip
        // Scale frame to match strip size (2×6 inches)
        stripCtx.drawImage(frameImg, 0, 0, stripWidthPx, stripHeightPx);
        
        // Now create the final 4×6 canvas and duplicate the framed strip
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvasWidthPx;
        finalCanvas.height = canvasHeightPx;
        const finalCtx = finalCanvas.getContext('2d');
        
        // Fill background with white
        finalCtx.fillStyle = '#FFFFFF';
        finalCtx.fillRect(0, 0, canvasWidthPx, canvasHeightPx);
        
        // Draw the framed strip twice: once on the left, once on the right
        // Left strip (x: 0)
        finalCtx.drawImage(stripCanvas, 0, 0);
        
        // Right strip (x: stripWidthPx = 600)
        finalCtx.drawImage(stripCanvas, stripWidthPx, 0);
        
        // Convert to base64 image
        const finalImage = finalCanvas.toDataURL('image/png', 1.0);
        resolve(finalImage);
      } catch (error) {
        console.error('Error applying frame to strip-grid:', error);
        reject(error);
      }
    };
    
    compositeImg.onload = () => {
      compositeLoaded = true;
      processImages();
    };
    
    compositeImg.onerror = () => {
      reject(new Error('Failed to load composite image'));
    };
    
    frameImg.onload = () => {
      frameLoaded = true;
      processImages();
    };
    
    frameImg.onerror = () => {
      reject(new Error('Failed to load frame image'));
    };
    
    // Load images
    compositeImg.src = compositeImageDataUrl;
    frameImg.src = frameImageSrc;
  });
}

/**
 * Get frame preview image (for UI display)
 * Creates a thumbnail preview of how the frame looks
 * 
 * @param {string} frameImageSrc - Path or data URL of the frame PNG
 * @param {number} maxWidth - Maximum width for preview (default 200)
 * @param {number} maxHeight - Maximum height for preview (default 200)
 * @returns {Promise<string>} Base64 data URL of preview image
 */
export async function getFramePreview(frameImageSrc, maxWidth = 200, maxHeight = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate preview dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      // Draw frame
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/png', 1.0));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load frame for preview'));
    };
    
    img.src = frameImageSrc;
  });
}

