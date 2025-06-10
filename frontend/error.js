// Compatibility wrapper for the old error handling system

// Import the error handling utilities from the modular structure
import { showError } from './js/utils/uiUtils.js';

// Export the showError function for backward compatibility
window.showError = showError;
