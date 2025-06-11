/**
 * UI utilities
 */

/**
 * Show error message
 * @param {string|Error} error - Error message or Error object
 * @param {string} [context] - Optional context where the error occurred
 */
export function showError(error, context = '') {
    // Extract message if it's an Error object
    const message = error instanceof Error ? error.message : error;
    
    const errorPopup = document.createElement('div');
    errorPopup.className = 'error-popup';
    
    // Add error icon
    const errorIcon = document.createElement('span');
    errorIcon.className = 'error-icon';
    errorIcon.innerHTML = '❌';
    errorPopup.appendChild(errorIcon);
    
    // Add error message with context if provided
    const errorText = document.createElement('span');
    errorText.className = 'error-text';
    errorText.textContent = context ? `${context}: ${message}` : message;
    errorPopup.appendChild(errorText);
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'error-close';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => {
        errorPopup.classList.add('fade-out');
        setTimeout(() => {
            errorPopup.remove();
        }, 500);
    });
    errorPopup.appendChild(closeBtn);
    
    document.body.appendChild(errorPopup);
    
    // Log to console for debugging
    console.error(context || 'Error', error);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorPopup.classList.add('fade-out');
        setTimeout(() => {
            errorPopup.remove();
        }, 500); // Fade out takes 0.5s
    }, 5000);
}

/**
 * Show success message
 * @param {string} message - Success message
 */
export function showSuccess(message) {
    const successPopup = document.createElement('div');
    successPopup.className = 'success-message';
    
    // Add success icon
    const successIcon = document.createElement('span');
    successIcon.className = 'success-icon';
    successIcon.innerHTML = '✅';
    successPopup.appendChild(successIcon);
    
    // Add success message
    const successText = document.createElement('span');
    successText.className = 'success-text';
    successText.textContent = message;
    successPopup.appendChild(successText);
    
    document.body.appendChild(successPopup);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        successPopup.classList.add('fade-out');
        setTimeout(() => {
            successPopup.remove();
        }, 500); // Fade out takes 0.5s
    }, 3000);
}

/**
 * Show loading indicator
 * @returns {object} - Loading indicator object with remove method
 */
export function showLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    loadingOverlay.appendChild(spinner);
    document.body.appendChild(loadingOverlay);
    
    return {
        remove: () => {
            loadingOverlay.remove();
        }
    };
}

/**
 * Toggle between views
 * @param {string} viewName - Name of the view to show ('file' or 'prompts')
 */
export function toggleView(viewName) {
    const fileView = document.getElementById('fileView');
    const promptsView = document.getElementById('promptsView');
    const fileBtn = document.getElementById('fileBtn');
    const promptsBtn = document.getElementById('promptsBtn');
    
    if (viewName === 'file') {
        fileView.classList.remove('hidden');
        fileView.style.display = 'block';
        promptsView.classList.add('hidden');
        promptsView.style.display = 'none';
        if (fileBtn) fileBtn.classList.add('active');
        if (promptsBtn) promptsBtn.classList.remove('active');
    } else if (viewName === 'prompts') {
        fileView.classList.add('hidden');
        fileView.style.display = 'none';
        promptsView.classList.remove('hidden');
        promptsView.style.display = 'block';
        if (fileBtn) fileBtn.classList.remove('active');
        if (promptsBtn) promptsBtn.classList.add('active');
    }
}

/**
 * Format date as a human-readable string
 * @param {Date|string} date - Date object or date string
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleString();
}

/**
 * Get file type icon
 * @param {string} fileType - File type
 * @returns {string} - Icon character
 */
export function getFileTypeIcon(fileType) {
    switch (fileType) {
        case 'folder': return '📁';
        case 'txt': return '📄';
        case 'md': return '📝';
        case 'pdf': return '📑';
        case 'epub': return '📚';
        default: return '📄';
    }
}
