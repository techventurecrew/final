/**
 * Printer Detection Utility
 * 
 * Provides functions to detect available printers and manage printer selection
 * Auto-detects printers on system load and provides printer selection functionality
 */

/**
 * Detect available printers from backend API
 * @returns {Promise<Array>} Array of available printers with name and status
 */
export async function detectPrinters() {
    try {
        const response = await fetch('http://localhost:3001/api/printers');
        const data = await response.json();

        if (data.success && data.printers && data.printers.length > 0) {
            return data.printers;
        }

        // Fallback: return default printer if detection fails
        return [{ name: 'Default Printer', status: 'Unknown' }];
    } catch (error) {
        console.error('Error detecting printers:', error);
        // Return default printer on error
        return [{ name: 'Default Printer', status: 'Unknown' }];
    }
}

/**
 * Get default printer (first available or system default)
 * @param {Array} printers - Array of available printers
 * @returns {Object} Default printer object
 */
export function getDefaultPrinter(printers) {
    if (!printers || printers.length === 0) {
        return { name: 'Default Printer', status: 'Unknown' };
    }

    // Try to find a printer with "Ready" or "Idle" status
    const readyPrinter = printers.find(p =>
        p.status === 'Ready' || p.status === 'Idle' || p.status === 'Online'
    );

    if (readyPrinter) {
        return readyPrinter;
    }

    // Fallback to first printer
    return printers[0];
}

/**
 * Store selected printer in localStorage
 * @param {Object} printer - Printer object to store
 */
export function saveSelectedPrinter(printer) {
    try {
        localStorage.setItem('selectedPrinter', JSON.stringify(printer));
    } catch (error) {
        console.error('Error saving printer selection:', error);
    }
}

/**
 * Get stored printer selection from localStorage
 * @returns {Object|null} Stored printer object or null
 */
export function getStoredPrinter() {
    try {
        const stored = localStorage.getItem('selectedPrinter');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Error reading stored printer:', error);
        return null;
    }
}

