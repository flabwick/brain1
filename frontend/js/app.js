/**
 * Main application script
 */
import apiService from './services/api.js';
import fileTreeComponent from './components/fileTree.js';
import fileContentComponent from './components/fileContent.js';
import fileCreationComponent from './components/fileCreation.js';
import promptsComponent from './components/prompts.js';
import substitutesComponent from './components/substitutes.js';
import { showError, toggleView } from './utils/uiUtils.js';

// DOM Elements
const fileBtn = document.getElementById('fileBtn');
const promptsBtn = document.getElementById('promptsBtn');
const deleteBtn = document.getElementById('deleteBtn');

// State
let currentView = 'file'; // 'file' or 'prompts'

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
        
        // Set initial view
        toggleView('file');
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize the application. Please reload the page.');
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
