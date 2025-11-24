/**
 * Extracts the left 2×6 strip from a 4×6 composite image (for display purposes)
 * 
 * @param {string} compositeImageDataUrl - Base64 data URL of the 4×6 composite image
 * @param {number} dpi - Print resolution (default 300 DPI)
 * @returns {Promise<string>} Base64 data URL of the extracted 2×6 strip
 */
export async function extractStripFromComposite(compositeImageDataUrl, dpi = 300) {
  // Strip dimensions: 2 inch width × 6 inch height
  const stripWidthInches = 2;
  const stripHeightInches = 6;
  
  // Convert to pixels at specified DPI
  const stripWidthPx = Math.round(stripWidthInches * dpi); // 600 px
  const stripHeightPx = Math.round(stripHeightInches * dpi); // 1800 px

  return new Promise((resolve, reject) => {
    const compositeImg = new Image();
    
    compositeImg.onload = () => {
      try {
        // Create canvas for the 2×6 strip
        const stripCanvas = document.createElement('canvas');
        stripCanvas.width = stripWidthPx;
        stripCanvas.height = stripHeightPx;
        const stripCtx = stripCanvas.getContext('2d');
        
        // Extract the left half (first 600px) from the composite
        stripCtx.drawImage(
          compositeImg,
          0, 0, stripWidthPx, stripHeightPx,  // source: left half of composite
          0, 0, stripWidthPx, stripHeightPx  // destination: full strip canvas
        );
        
        // Return as base64 data URL
        const stripImage = stripCanvas.toDataURL('image/jpeg', 0.95);
        resolve(stripImage);
      } catch (error) {
        console.error('Error extracting strip:', error);
        reject(error);
      }
    };
    
    compositeImg.onerror = () => {
      reject(new Error('Failed to load composite image'));
    };
    
    compositeImg.src = compositeImageDataUrl;
  });
}

/**
 * Gets page size configuration based on grid layout
 * Auto-configures page dimensions according to standard photo print sizes
 * 
 * @param {Object} grid - Grid configuration { cols: number, rows: number, id: string }
 * @returns {Object} Page size configuration { widthInches, heightInches, pageSize }
 */
export function getPageSizeFromGrid(grid) {
  if (!grid) {
    return { widthInches: 4, heightInches: 6, pageSize: '4x6' };
  }

  const gridId = typeof grid === 'string' ? grid : grid.id;

  // Map grid IDs to standard photo print sizes
  // All grids use 4x6 inch print size
  const gridToPageSize = {
    '4x6-single': { widthInches: 4, heightInches: 6, pageSize: '4x6' },
    '4x6-2cut': { widthInches: 4, heightInches: 6, pageSize: '4x6' },
    '4x6-4cut': { widthInches: 4, heightInches: 6, pageSize: '4x6' },
    '4x6-6cut': { widthInches: 4, heightInches: 6, pageSize: '4x6' },
    'strip-grid': { widthInches: 4, heightInches: 6, pageSize: '4x6' },
    // Legacy grid IDs for backward compatibility
    '5x5-single': { widthInches: 4, heightInches: 6, pageSize: '4x6' },
    '2x4-vertical-2': { widthInches: 4, heightInches: 6, pageSize: '4x6' },
    '5x7-6cut': { widthInches: 4, heightInches: 6, pageSize: '4x6' }
  };

  // If exact match found, use it
  if (gridToPageSize[gridId]) {
    return gridToPageSize[gridId];
  }

  // Calculate based on grid dimensions if no exact match
  const cols = grid.cols || 1;
  const rows = grid.rows || 1;

  // Default cell size: 2x3 inches (standard photo cell)
  const cellWidth = 2;
  const cellHeight = 3;

  // Calculate total page size with margins
  const margin = 0.1; // 0.1 inch margin between cells
  const widthInches = (cellWidth * cols) + (margin * (cols - 1));
  const heightInches = (cellHeight * rows) + (margin * (rows - 1));

  // Round to nearest standard size
  const standardSizes = [
    { w: 2, h: 4, name: '2x4' },
    { w: 4, h: 6, name: '4x6' },
    { w: 5, h: 7, name: '5x7' },
    { w: 8, h: 10, name: '8x10' }
  ];

  // Find closest standard size
  let closest = standardSizes[0];
  let minDiff = Math.abs(widthInches - closest.w) + Math.abs(heightInches - closest.h);

  standardSizes.forEach(size => {
    const diff = Math.abs(widthInches - size.w) + Math.abs(heightInches - size.h);
    if (diff < minDiff) {
      minDiff = diff;
      closest = size;
    }
  });

  return {
    widthInches: closest.w,
    heightInches: closest.h,
    pageSize: closest.name
  };
}

/**
 * Creates a strip-grid composite image
 * Takes 4 photos, arranges them in a 1×4 grid (2×6 inch strip), and duplicates it side-by-side
 * Final output is exactly 4×6 inches (1200×1800 px at 300 DPI)
 * 
 * @param {string[]} photos - Array of 4 base64 image data URLs
 * @param {number} dpi - Print resolution (default 300 DPI)
 * @returns {Promise<string>} Base64 data URL of the composite image
 */
export async function createStripGridComposite(photos, dpi = 300) {
  if (!photos || photos.length !== 4) {
    throw new Error('Strip grid requires exactly 4 photos');
  }

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

  // Cell dimensions: 4 rows in 6 inches = 1.5 inches per cell
  const cellHeightInches = stripHeightInches / 4; // 1.5 inches
  const cellWidthInches = stripWidthInches; // 2 inches
  const cellWidthPx = stripWidthPx; // 600 px
  const cellHeightPx = Math.round(cellHeightInches * dpi); // 450 px

  // Load all images
  const imagePromises = photos.map((photoSrc) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = photoSrc;
    });
  });

  const images = await Promise.all(imagePromises);

  // First, create the single strip canvas (2×6 inches)
  const stripCanvas = document.createElement('canvas');
  stripCanvas.width = stripWidthPx;
  stripCanvas.height = stripHeightPx;
  const stripCtx = stripCanvas.getContext('2d');

  // Fill background with white
  stripCtx.fillStyle = '#FFFFFF';
  stripCtx.fillRect(0, 0, stripWidthPx, stripHeightPx);

  // Arrange 4 photos in 1×4 grid (stacked vertically)
  images.forEach((img, index) => {
    const cellY = index * cellHeightPx;
    
    // Calculate how to fit the image into the cell while maintaining aspect ratio
    const imgAspect = img.width / img.height;
    const cellAspect = cellWidthPx / cellHeightPx; // 600/450 = 4/3

    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > cellAspect) {
      // Image is wider relative to cell - fit to width
      drawWidth = cellWidthPx;
      drawHeight = cellWidthPx / imgAspect;
      drawX = 0;
      drawY = cellY + (cellHeightPx - drawHeight) / 2; // Center vertically in cell
    } else {
      // Image is taller relative to cell - fit to height
      drawHeight = cellHeightPx;
      drawWidth = cellHeightPx * imgAspect;
      drawX = (cellWidthPx - drawWidth) / 2; // Center horizontally
      drawY = cellY;
    }

    // Draw the image into the cell
    stripCtx.drawImage(
      img,
      0, 0, img.width, img.height,
      drawX, drawY, drawWidth, drawHeight
    );
  });

  // Now create the final canvas (4×6 inches) and duplicate the strip side-by-side
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidthPx;
  canvas.height = canvasHeightPx;
  const ctx = canvas.getContext('2d');

  // Fill background with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx);

  // Draw the strip twice: once on the left, once on the right
  // Left strip (x: 0)
  ctx.drawImage(stripCanvas, 0, 0);

  // Right strip (x: stripWidthPx = 600)
  ctx.drawImage(stripCanvas, stripWidthPx, 0);

  // Return composite as base64 data URL
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Creates a composite image from multiple photos arranged in a grid layout
 * with dynamic canvas sizing that preserves original image aspect ratios
 * Auto-configures page size based on grid layout
 * 
 * Photo arrangement: Vertical cell arrangement (fills top to bottom, then left to right)
 * Example for 2x2 grid:
 *   [1] [3]
 *   [2] [4]
 * 
 * @param {string[]} photos - Array of base64 image data URLs
 * @param {Object} grid - Grid configuration { cols: number, rows: number, id: string, isStripGrid?: boolean }
 * @param {number} dpi - Print resolution (default 300 DPI)
 * @param {number} marginPercent - Margin as percentage of cell size (default 2%)
 * @param {number} maxCellWidth - Maximum cell width in inches (optional, auto-calculated if not provided)
 * @returns {Promise<string>} Base64 data URL of the composite image
 */

export async function createGridComposite(photos, grid, dpi = 300, marginPercent = 2, maxCellWidth = null) {
  if (!photos || photos.length === 0) {
    throw new Error('No photos provided');
  }

  if (!grid || !grid.cols || !grid.rows) {
    throw new Error('Invalid grid configuration');
  }

  // Handle strip-grid layout specially
  if (grid.id === 'strip-grid' || grid.isStripGrid) {
    if (photos.length !== 4) {
      throw new Error(`Strip grid requires exactly 4 photos, got ${photos.length}`);
    }
    return createStripGridComposite(photos, dpi);
  }

  const totalCells = grid.cols * grid.rows;
  if (photos.length !== totalCells) {
    throw new Error(`Expected ${totalCells} photos, got ${photos.length}`);
  }

  // Auto-configure page size based on grid
  const pageConfig = getPageSizeFromGrid(grid);

  // Auto-calculate maxCellWidth if not provided
  if (maxCellWidth === null) {
    // Calculate cell size based on page dimensions and grid layout
    const marginInches = 0.1; // 0.1 inch margin between cells
    const availableWidth = pageConfig.widthInches - (marginInches * (grid.cols - 1));
    const availableHeight = pageConfig.heightInches - (marginInches * (grid.rows - 1));
    maxCellWidth = Math.min(availableWidth / grid.cols, availableHeight / grid.rows);
  }

  // Load all images first to get their dimensions
  const imagePromises = photos.map((photoSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = photoSrc;
    });
  });

  try {
    const images = await Promise.all(imagePromises);

    // Calculate max cell dimensions based on image aspect ratios
    // This ensures all images fit without cropping
    const cellDimensions = new Map();

    // Group images by cell position and calculate required space
    images.forEach((img, index) => {
      // Standard vertical arrangement: fill top to bottom, then left to right
      const row = index % grid.rows;
      const col = Math.floor(index / grid.rows);
      
      const cellKey = `${col}-${row}`;

      const imgAspect = img.width / img.height;

      if (!cellDimensions.has(cellKey)) {
        cellDimensions.set(cellKey, {
          aspect: imgAspect,
          minWidth: imgAspect > 1 ? maxCellWidth : maxCellWidth / imgAspect,
          minHeight: imgAspect > 1 ? maxCellWidth / imgAspect : maxCellWidth
        });
      } else {
        // If multiple images in same cell (shouldn't happen with this logic)
        const current = cellDimensions.get(cellKey);
        current.aspect = Math.max(current.aspect, imgAspect);
      }
    });

    // Calculate optimal cell size (use max across all cells for uniformity)
    let maxCellHeightInches = maxCellWidth;
    let maxCellWidthInches = maxCellWidth;

    cellDimensions.forEach(dims => {
      if (dims.aspect > 1) {
        // Wide image
        maxCellHeightInches = Math.max(maxCellHeightInches, maxCellWidth / dims.aspect);
      } else {
        // Tall image
        maxCellWidthInches = Math.max(maxCellWidthInches, maxCellWidth * dims.aspect);
      }
    });

    // Convert to pixels at specified DPI
    const cellWidthPx = Math.round(maxCellWidthInches * dpi);
    const cellHeightPx = Math.round(maxCellHeightInches * dpi);

    // Calculate margin in pixels
    const marginSize = Math.round(Math.min(cellWidthPx, cellHeightPx) * (marginPercent / 100));

    // Calculate total canvas size using grid dimensions
    // Total width = left margin + (cell width + margin) * cols + right margin
    // Total height = top margin + (cell height + margin) * rows + bottom margin
    const canvasWidth = marginSize + (cellWidthPx + marginSize) * grid.cols;
    const canvasHeight = marginSize + (cellHeightPx + marginSize) * grid.rows;

    // Create canvas with calculated dimensions
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Fill background with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Composite each image into its corresponding cell
    images.forEach((img, index) => {
      // Standard vertical arrangement: fill top to bottom, then left to right
      const row = index % grid.rows;
      const col = Math.floor(index / grid.rows);

      // Calculate cell position
      const cellX = marginSize + col * (cellWidthPx + marginSize);
      const cellY = marginSize + row * (cellHeightPx + marginSize);

      // Calculate scaled dimensions to fit in cell while maintaining aspect ratio
      // and avoiding cropping
      const imgAspect = img.width / img.height;
      const cellAspect = cellWidthPx / cellHeightPx;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > cellAspect) {
        // Image is wider relative to cell - fit to width
        drawWidth = cellWidthPx;
        drawHeight = cellWidthPx / imgAspect;
        drawX = cellX;
        drawY = cellY + (cellHeightPx - drawHeight) / 2; // Center vertically
      } else {
        // Image is taller relative to cell - fit to height
        drawHeight = cellHeightPx;
        drawWidth = cellHeightPx * imgAspect;
        drawX = cellX + (cellWidthPx - drawWidth) / 2; // Center horizontally
        drawY = cellY;
      }

      // Draw full image (no cropping)
      ctx.drawImage(
        img,
        0, 0, img.width, img.height,              // source (full image)
        drawX, drawY, drawWidth, drawHeight       // destination (scaled to fit)
      );
    });

    // Return composite as base64 data URL
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Error creating composite:', error);
    throw error;
  }
}