/**
 * File tree component
 */
import apiService from '../services/api.js';
import { showError } from '../utils/uiUtils.js';

class FileTreeComponent {
    constructor() {
        this.fileTreeElement = document.getElementById('fileTree');
        this.currentSelectedItem = null;
        this.onFileSelect = null; // Callback for when a file is selected
        this.draggedItem = null; // Track the item being dragged
        
        // Initialize drag and drop event listeners for the file tree container
        this.initDragAndDrop();
    }
    
    /**
     * Initialize drag and drop event handlers
     */
    initDragAndDrop() {
        // Allow the file tree to accept drops
        this.fileTreeElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileTreeElement.classList.add('drag-over');
        });
        
        this.fileTreeElement.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileTreeElement.classList.remove('drag-over');
        });
        
        this.fileTreeElement.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fileTreeElement.classList.remove('drag-over');
            
            if (this.draggedItem && e.target.closest('.file-tree-item')) {
                const targetItem = e.target.closest('.file-tree-item');
                const targetPath = targetItem.dataset.path;
                const sourcePath = this.draggedItem.dataset.path;
                
                try {
                    await this.moveFileOrFolder(sourcePath, targetPath);
                    await this.loadFileTree(); // Refresh the file tree
                } catch (error) {
                    showError('Failed to move item: ' + error.message);
                }
            }
        });
    }
    
    /**
     * Move a file or folder to a new location
     * @param {string} sourcePath - The path of the file/folder to move
     * @param {string} targetPath - The destination path
     */
    async moveFileOrFolder(sourcePath, targetPath) {
        try {
            await apiService.moveFileOrFolder(sourcePath, targetPath);
        } catch (error) {
            throw new Error(`Failed to move item: ${error.message}`);
        }
    }
    
    /**
     * Set callback for file selection
     * @param {function} callback - Function to call when a file is selected
     */
    setOnFileSelectCallback(callback) {
        this.onFileSelect = callback;
    }
    
    /**
     * Load the file tree
     */
    async loadFileTree() {
        try {
            const files = await apiService.getFileTree();
            this.renderFileTree(files);
        } catch (error) {
            showError('Failed to load file tree: ' + error.message);
        }
    }
    
    /**
     * Render the file tree
     * @param {Array} files - Array of file objects
     */
    renderFileTree(files) {
        // Clear the file tree
        this.fileTreeElement.innerHTML = '';
        
        // Group files by parent path
        const filesByParent = {};
        
        // Add root level
        filesByParent[''] = [];
        
        // Group files by parent path
        files.forEach(file => {
            if (!filesByParent[file.parentPath]) {
                filesByParent[file.parentPath] = [];
            }
            filesByParent[file.parentPath].push(file);
        });
        
        // Render root level files and folders
        const rootFiles = filesByParent[''] || [];
        rootFiles.sort((a, b) => {
            // Sort folders first, then by name
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
        
        this.renderFileTreeLevel(rootFiles, this.fileTreeElement, filesByParent);
    }
    
    /**
     * Render a level of the file tree
     * @param {Array} files - Files at this level
     * @param {HTMLElement} container - Container element for this level
     * @param {object} filesByParent - Files grouped by parent path
     */
    renderFileTreeLevel(files, container, filesByParent) {
        const ul = document.createElement('ul');
        ul.className = 'file-tree-list';
        
        files.forEach(file => {
            const li = document.createElement('li');
            li.className = 'file-tree-item draggable';
            li.dataset.path = file.path;
            li.dataset.type = file.type;
            li.draggable = true; // Make the item draggable
            
            const icon = document.createElement('span');
            icon.className = 'file-icon';
            icon.textContent = file.type === 'folder' ? '📁' : this.getFileIcon(file.type);
            
            const name = document.createElement('span');
            name.className = 'file-name';
            name.textContent = file.name;
            
            li.appendChild(icon);
            li.appendChild(name);
            
            // Add drag and drop events
            li.addEventListener('dragstart', (event) => {
                this.draggedItem = li;
                li.classList.add('dragging');
                event.dataTransfer.setData('text/plain', file.path);
                event.dataTransfer.effectAllowed = 'move';
            });
            
            li.addEventListener('dragend', () => {
                li.classList.remove('dragging');
                this.draggedItem = null;
            });
            
            li.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (file.type === 'folder' && this.draggedItem !== li) {
                    li.classList.add('drag-over');
                }
            });
            
            li.addEventListener('dragleave', (event) => {
                event.preventDefault();
                event.stopPropagation();
                li.classList.remove('drag-over');
            });
            
            li.addEventListener('drop', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                li.classList.remove('drag-over');
                
                if (this.draggedItem && file.type === 'folder') {
                    const sourcePath = this.draggedItem.dataset.path;
                    const targetPath = file.path;
                    
                    try {
                        await this.moveFileOrFolder(sourcePath, targetPath);
                        await this.loadFileTree(); // Refresh the file tree
                    } catch (error) {
                        showError('Failed to move item: ' + error.message);
                    }
                }
            });
            
            // Add click event to select the file or folder
            li.addEventListener('click', (event) => {
                event.stopPropagation();
                this.selectItem(li, file);
            });
            
            // If it's a folder and has children, add the children
            if (file.type === 'folder') {
                const childPath = file.path + '/';
                const children = filesByParent[childPath] || [];
                
                if (children.length > 0) {
                    children.sort((a, b) => {
                        // Sort folders first, then by name
                        if (a.type === 'folder' && b.type !== 'folder') return -1;
                        if (a.type !== 'folder' && b.type === 'folder') return 1;
                        return a.name.localeCompare(b.name);
                    });
                    
                    // Create container for children, initially hidden
                    const childContainer = document.createElement('div');
                    childContainer.className = 'file-tree-children hidden';
                    this.renderFileTreeLevel(children, childContainer, filesByParent);
                    
                    // Add expand/collapse functionality
                    li.classList.add('has-children');
                    li.classList.add('collapsed');
                    
                    li.addEventListener('click', (event) => {
                        event.stopPropagation();
                        
                        // Toggle collapsed state
                        li.classList.toggle('collapsed');
                        childContainer.classList.toggle('hidden');
                        
                        // Select the item
                        this.selectItem(li, file);
                    });
                    
                    li.appendChild(childContainer);
                }
            }
            
            // Drag and drop functionality
            li.setAttribute('draggable', 'true');
            
            li.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                this.draggedItem = li;
                setTimeout(() => {
                    li.classList.add('invisible');
                }, 0);
            });
            
            li.addEventListener('dragend', (e) => {
                e.stopPropagation();
                this.draggedItem = null;
                li.classList.remove('invisible');
            });
            
            ul.appendChild(li);
        });
        
        container.appendChild(ul);
    }
    
    /**
     * Get icon for file type
     * @param {string} fileType - File type
     * @returns {string} - Icon character
     */
    getFileIcon(fileType) {
        switch (fileType) {
            case 'txt': return '📄';
            case 'md': return '📝';
            case 'pdf': return '📑';
            case 'epub': return '📚';
            default: return '📄';
        }
    }
    
    /**
     * Select a file or folder in the tree
     * @param {HTMLElement} element - The li element to select
     * @param {object} fileData - The file data
     */
    selectItem(element, fileData) {
        // Deselect previously selected item
        if (this.currentSelectedItem) {
            this.currentSelectedItem.classList.remove('selected');
        }
        
        // Select new item
        element.classList.add('selected');
        this.currentSelectedItem = element;
        
        // Call the callback if provided
        if (this.onFileSelect) {
            this.onFileSelect(fileData);
        }
    }
}

// Export singleton instance
const fileTreeComponent = new FileTreeComponent();
export default fileTreeComponent;
