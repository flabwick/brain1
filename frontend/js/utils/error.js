/**
 * Error handling utilities
 * This file provides backward compatibility with the old error.js file
 */

// Handle uncaught errors
window.addEventListener('error', function(event) {
    console.error('Uncaught error:', event.error);
    
    // Create error popup
    const errorPopup = document.createElement('div');
    errorPopup.className = 'error-popup';
    errorPopup.textContent = 'An error occurred: ' + (event.error.message || 'Unknown error');
    
    document.body.appendChild(errorPopup);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        errorPopup.classList.add('fade-out');
        setTimeout(() => {
            errorPopup.remove();
        }, 500); // Fade out takes 0.5s
    }, 3000);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Create error popup
    const errorPopup = document.createElement('div');
    errorPopup.className = 'error-popup';
    errorPopup.textContent = 'Promise error: ' + (event.reason.message || 'Unknown error');
    
    document.body.appendChild(errorPopup);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        errorPopup.classList.add('fade-out');
        setTimeout(() => {
            errorPopup.remove();
        }, 500); // Fade out takes 0.5s
    }, 3000);
});
