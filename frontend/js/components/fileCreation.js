/**
 * File creation component
 */
import apiService from '../services/api.js';
import { showError } from '../utils/uiUtils.js';
import fileTreeComponent from './fileTree.js';

class FileCreationComponent {
    constructor() {
        // DOM Elements
        this.createBtn = document.getElementById('createBtn');
        this.createPanel = document.getElementById('createPanel');
        this.createOptions = document.querySelectorAll('.create-option');
        this.newItemNameInput = document.getElementById('newItemName');
        this.extensionDisplay = document.getElementById('extensionDisplay');
        this.confirmCreateBtn = document.getElementById('confirmCreate');
        this.cancelCreateBtn = document.getElementById('cancelCreate');
        
        this.currentFileType = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the component
     */
    init() {
        // Create button opens the create panel
        this.createBtn.addEventListener('click', () => {
            this.showCreatePanel();
        });
        
        // Create options select file type
        this.createOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectFileType(option.dataset.type);
            });
        });
        
        // Confirm create button
        this.confirmCreateBtn.addEventListener('click', () => {
            this.createNewItem();
        });
        
        // Cancel create button
        this.cancelCreateBtn.addEventListener('click', () => {
            this.hideCreatePanel();
        });
        
        // Enter key in input creates new item
        this.newItemNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.createNewItem();
            }
        });
    }
    
    /**
     * Show the create panel
     */
    showCreatePanel() {
        this.createPanel.classList.remove('hidden');
        this.newItemNameInput.value = '';
        this.currentFileType = null;
        this.extensionDisplay.textContent = '';
        
        // Deselect all options
        this.createOptions.forEach(option => {
            option.classList.remove('selected');
        });

        // Focus the input field
        setTimeout(() => this.newItemNameInput.focus(), 10);
    }
    
    /**
     * Hide the create panel
     */
    hideCreatePanel() {
        this.createPanel.classList.add('hidden');
    }
    
    /**
     * Select a file type
     * @param {string} type - File type
     */
    selectFileType(type) {
        this.currentFileType = type;
        
        // Deselect all options
        this.createOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select the clicked option
        const selectedOption = Array.from(this.createOptions).find(
            option => option.dataset.type === type
        );
        
        if (selectedOption) {
            selectedOption.classList.add('selected');
            
            // Update the extension display based on the type
            if (type === 'folder') {
                this.extensionDisplay.textContent = '';
            } else {
                this.extensionDisplay.textContent = '.' + type;
            }
            
            // Focus the input field after selecting a type
            this.newItemNameInput.focus();
        }
    }
    
    /**
     * Create a new file or folder
     */
    async createNewItem() {
        const name = this.newItemNameInput.value.trim();
        
        if (!name) {
            showError('Please enter a name for the new item');
            return;
        }
        
        if (!this.currentFileType) {
            showError('Please select a file type first');
            return;
        }
        
        // Check if name already contains the extension and remove it if it does
        if (this.currentFileType !== 'folder' && name.endsWith('.' + this.currentFileType)) {
            const extensionPart = '.' + this.currentFileType;
            const nameWithoutExtension = name.substring(0, name.length - extensionPart.length);
            this.newItemNameInput.value = nameWithoutExtension;
        }
        
        try {
            // Get the parent path from the selected item
            const selectedElement = document.querySelector('.file-tree-item.selected');
            let parentPath = '';
            
            if (selectedElement) {
                const path = selectedElement.dataset.path;
                const type = selectedElement.dataset.type;

                // If it's a folder, use its path as parent path
                if (type === 'folder') {
                    parentPath = path ? path + '/' : '';
                } else {
                    // If it's a file, use its parent path
                    const pathParts = path.split('/');
                    pathParts.pop();
                    parentPath = pathParts.length > 0 ? pathParts.join('/') + '/' : '';
                }
            }
            
            // Create the new file or folder
            const newPath = parentPath + name + (this.currentFileType !== 'folder' ? '.' + this.currentFileType : '');
            
            const newItem = {
                name: name + (this.currentFileType !== 'folder' ? '.' + this.currentFileType : ''),
                type: this.currentFileType,
                path: newPath,
                parentPath: parentPath,
                content: ''
            };
            
            await apiService.createFile(newItem);
            
            // Reload file tree
            await fileTreeComponent.loadFileTree();
            
            // Hide create panel
            this.hideCreatePanel();
        } catch (error) {
            showError('Failed to create new item: ' + error.message);
        }
    }
}

// Export singleton instance
const fileCreationComponent = new FileCreationComponent();
export default fileCreationComponent;
