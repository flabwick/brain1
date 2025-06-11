/**
 * Main application script
 */
import apiService from './services/api.js';
import fileTreeComponent from './components/fileTree.js';
import fileContentComponent from './components/fileContent.js';
import fileCreationComponent from './components/fileCreation.js';
import promptsComponent from './components/prompts.js';
import substitutesComponent from './components/substitutes.js';
import { showError, showSuccess, toggleView } from './utils/uiUtils.js';
import { extractLinks, validateLink, resolveLinksInText } from './utils/fileUtils.js';

// DOM Elements
const fileBtn = document.getElementById('fileBtn');
const promptsBtn = document.getElementById('promptsBtn');
const deleteBtn = document.getElementById('deleteBtn');
const sidebar = document.querySelector('.sidebar');
const sidebarResizeHandle = document.querySelector('.sidebar-resize-handle');

// State
let currentView = 'file'; // 'file' or 'prompts'
let sidebarResizing = false;
let initialX;
let initialWidth;

// Initialize the application
async function initApp() {
    try {
        // Initialize API service
        await apiService.init();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load file tree
        await fileTreeComponent.loadFileTree();
        
        // Set file tree select callback
        fileTreeComponent.setOnFileSelectCallback(fileData => {
            fileContentComponent.loadFileContent(fileData);
        });
        
        // Setup sidebar resize functionality
        setupSidebarResize();
        
        // Restore sidebar width if previously saved
        restoreSidebarWidth();
        
        // Set initial view
        toggleView('file');
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize the application. Please reload the page.');
    }
}

// Setup sidebar resize functionality
function setupSidebarResize() {
    if (sidebarResizeHandle) {
        sidebarResizeHandle.addEventListener('mousedown', startResize);
    }
}

// Start sidebar resize
function startResize(e) {
    sidebarResizing = true;
    initialX = e.clientX;
    initialWidth = sidebar.offsetWidth;
    
    // Add event listeners
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    
    // Add a class to indicate resizing
    document.body.classList.add('sidebar-resizing');
    
    // Prevent text selection during resize
    e.preventDefault();
}

// Handle resize during mouse move
function resize(e) {
    if (sidebarResizing) {
        const deltaX = e.clientX - initialX;
        const newWidth = initialWidth + deltaX;
        
        // Apply min and max constraints
        if (newWidth >= 150 && newWidth <= 500) {
            sidebar.style.width = `${newWidth}px`;
        }
    }
}

// Stop sidebar resize
function stopResize() {
    sidebarResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    document.body.classList.remove('sidebar-resizing');
    
    // Save the sidebar width to localStorage for persistence
    localStorage.setItem('sidebarWidth', sidebar.style.width);
}

// Restore sidebar width from localStorage
function restoreSidebarWidth() {
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
        sidebar.style.width = savedWidth;
    }
}

// Setup event listeners
function setupEventListeners() {
    // File view button
    fileBtn.addEventListener('click', () => {
        toggleView('file');
        currentView = 'file';
    });
    
    // Prompts view button
    promptsBtn.addEventListener('click', async () => {
        toggleView('prompts');
        currentView = 'prompts';
        
        // Load prompts and substitutes
        await promptsComponent.loadPrompts();
        await substitutesComponent.loadSubstitutes();
    });
    
    // Delete button
    deleteBtn.addEventListener('click', () => {
        deleteSelectedItem();
    });
}

// Delete selected item (file, folder, prompt, or substitute)
async function deleteSelectedItem() {
    if (currentView === 'file') {
        const selectedItem = document.querySelector('.file-tree-item.selected');
        if (!selectedItem) {
            showError('No file or folder selected');
            return;
        }
        
        const path = selectedItem.dataset.path;
        const type = selectedItem.dataset.type;
        const itemName = selectedItem.querySelector('.file-name').textContent;
        
        if (!confirm(`Are you sure you want to delete this ${type}: ${itemName}?`)) {
            return;
        }
        
        try {
            await apiService.deleteFile(path);
            await fileTreeComponent.loadFileTree();
            document.getElementById('fileContent').innerHTML = '';
        } catch (error) {
            showError('Failed to delete file: ' + error.message);
        }
    } else if (currentView === 'prompts') {
        // Handling for prompts/substitutes delete is in their respective components
        showError('Please use the delete button in the prompts or substitutes list');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);
