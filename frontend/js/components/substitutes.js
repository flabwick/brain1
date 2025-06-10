/**
 * Substitutes management component
 */
import apiService from '../services/api.js';
import { showError } from '../utils/uiUtils.js';

class SubstitutesComponent {
    constructor() {
        // DOM Elements
        this.substitutesList = document.getElementById('substitutesList');
        this.createSubstituteBtn = document.getElementById('createSubstituteBtn');
        this.substituteModal = document.getElementById('substituteModal');
        this.substituteModalTitle = document.getElementById('substituteModalTitle');
        this.substituteName = document.getElementById('substituteName');
        this.substituteFilePath = document.getElementById('substituteFilePath');
        this.saveSubstituteBtn = document.getElementById('saveSubstituteBtn');
        this.cancelSubstituteBtn = document.getElementById('cancelSubstituteBtn');
        this.browseFilesBtn = document.getElementById('browseFilesBtn');
        this.fileBrowserModal = document.getElementById('fileBrowserModal');
        this.modalFileTree = document.getElementById('modalFileTree');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.cancelFileBrowseBtn = document.getElementById('cancelFileBrowseBtn');
        
        this.currentSubstituteId = null;
        this.selectedFilePath = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the component
     */
    init() {
        // Create substitute button opens the substitute modal
        this.createSubstituteBtn.addEventListener('click', () => {
            this.openSubstituteModal();
        });
        
        // Save substitute button
        this.saveSubstituteBtn.addEventListener('click', () => {
            this.saveSubstitute();
        });
        
        // Cancel substitute button
        this.cancelSubstituteBtn.addEventListener('click', () => {
            this.closeSubstituteModal();
        });
        
        // Browse files button
        this.browseFilesBtn.addEventListener('click', () => {
            this.openFileBrowser();
        });
        
        // Select file button
        this.selectFileBtn.addEventListener('click', () => {
            this.selectFile();
        });
        
        // Cancel file browse button
        this.cancelFileBrowseBtn.addEventListener('click', () => {
            this.closeFileBrowser();
        });
    }
    
    /**
     * Load all substitutes
     */
    async loadSubstitutes() {
        try {
            const substitutes = await apiService.getAllSubstitutes();
            this.renderSubstitutesList(substitutes);
        } catch (error) {
            showError(error, 'Failed to load substitutes');
        }
    }
    
    /**
     * Render substitutes list
     * @param {Array} substitutes - Array of substitute objects
     */
    renderSubstitutesList(substitutes) {
        this.substitutesList.innerHTML = '';
        
        try {
            if (!Array.isArray(substitutes)) {
                throw new Error('Invalid substitutes data format');
            }
            
            if (substitutes.length === 0) {
                const noSubstitutes = document.createElement('p');
                noSubstitutes.textContent = 'No substitutes found. Create one!';
                this.substitutesList.appendChild(noSubstitutes);
                return;
            }
            
            const table = document.createElement('table');
            table.className = 'substitutes-table';
            
            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const nameHeader = document.createElement('th');
            nameHeader.textContent = 'Name';
        
        const filePathHeader = document.createElement('th');
        filePathHeader.textContent = 'File Path';
        
        const actionsHeader = document.createElement('th');
        actionsHeader.textContent = 'Actions';
        
        headerRow.appendChild(nameHeader);
        headerRow.appendChild(filePathHeader);
        headerRow.appendChild(actionsHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        substitutes.forEach(substitute => {
            const row = document.createElement('tr');
            row.dataset.id = substitute._id;
            
            const nameCell = document.createElement('td');
            nameCell.textContent = substitute.name;
            
            const filePathCell = document.createElement('td');
            filePathCell.textContent = substitute.filePath;
            
            const actionsCell = document.createElement('td');
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                this.editSubstitute(substitute);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                this.deleteSubstitute(substitute._id);
            });
            
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(nameCell);
            row.appendChild(filePathCell);
            row.appendChild(actionsCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        this.substitutesList.appendChild(table);
        } catch (error) {
            console.error('Error rendering substitutes list:', error);
            const errorElement = document.createElement('p');
            errorElement.className = 'error-message';
            errorElement.textContent = 'Failed to render substitutes: ' + error.message;
            this.substitutesList.appendChild(errorElement);
        }
    }
    
    /**
     * Open substitute modal for creation or editing
     * @param {object} substitute - Substitute data for editing (optional)
     */
    openSubstituteModal(substitute = null) {
        if (substitute) {
            this.substituteModalTitle.textContent = 'Edit Substitute';
            this.substituteName.value = substitute.name;
            this.substituteFilePath.value = substitute.filePath;
            this.currentSubstituteId = substitute._id;
        } else {
            this.substituteModalTitle.textContent = 'Create Substitute';
            this.substituteName.value = '';
            this.substituteFilePath.value = '';
            this.currentSubstituteId = null;
        }
        
        this.substituteModal.style.display = 'block';
    }
    
    /**
     * Close substitute modal
     */
    closeSubstituteModal() {
        this.substituteModal.style.display = 'none';
    }
    
    /**
     * Open file browser to select a file
     */
    async openFileBrowser() {
        try {
            this.fileBrowserModal.style.display = 'block';
            
            // Load file tree for browser
            const files = await apiService.getFileTree();
            this.renderModalFileTree(files);
        } catch (error) {
            showError('Failed to open file browser: ' + error.message);
        }
    }
    
    /**
     * Close file browser
     */
    closeFileBrowser() {
        this.fileBrowserModal.style.display = 'none';
        this.selectedFilePath = null;
    }
    
    /**
     * Render file tree in modal
     * @param {Array} files - Array of file objects
     */
    renderModalFileTree(files) {
        // Clear modal file tree
        this.modalFileTree.innerHTML = '';
        
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
        
        this.renderModalFileTreeLevel(rootFiles, this.modalFileTree, filesByParent);
    }
    
    /**
     * Render a level of the file tree in modal
     * @param {Array} files - Files at this level
     * @param {HTMLElement} container - Container element for this level
     * @param {object} filesByParent - Files grouped by parent path
     */
    renderModalFileTreeLevel(files, container, filesByParent) {
        const ul = document.createElement('ul');
        ul.className = 'modal-file-tree-list';
        
        files.forEach(file => {
            const li = document.createElement('li');
            li.className = 'modal-file-tree-item';
            li.dataset.path = file.path;
            li.dataset.type = file.type;
            
            const icon = document.createElement('span');
            icon.className = 'file-icon';
            icon.textContent = file.type === 'folder' ? '📁' : this.getFileIcon(file.type);
            
            const name = document.createElement('span');
            name.className = 'file-name';
            name.textContent = file.name;
            
            li.appendChild(icon);
            li.appendChild(name);
            
            // Add click event to select the file or folder
            li.addEventListener('click', (event) => {
                event.stopPropagation();
                
                // Deselect previously selected item
                const selectedItem = document.querySelector('.modal-file-tree-item.selected');
                if (selectedItem) {
                    selectedItem.classList.remove('selected');
                }
                
                // Select this item
                li.classList.add('selected');
                this.selectedFilePath = file.path;
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
                    childContainer.className = 'modal-file-tree-children hidden';
                    this.renderModalFileTreeLevel(children, childContainer, filesByParent);
                    
                    // Add expand/collapse functionality
                    li.classList.add('has-children');
                    li.classList.add('collapsed');
                    
                    li.addEventListener('click', (event) => {
                        event.stopPropagation();
                        
                        // Toggle collapsed state
                        li.classList.toggle('collapsed');
                        childContainer.classList.toggle('hidden');
                    });
                    
                    li.appendChild(childContainer);
                }
            }
            
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
     * Select file from browser
     */
    selectFile() {
        if (!this.selectedFilePath) {
            showError('Please select a file');
            return;
        }
        
        this.substituteFilePath.value = this.selectedFilePath;
        this.closeFileBrowser();
    }
    
    /**
     * Save substitute (create or update)
     */
    async saveSubstitute() {
        try {
            const name = this.substituteName.value.trim();
            const filePath = this.substituteFilePath.value.trim();
            
            if (!name || !filePath) {
                showError('Name and file path are required');
                return;
            }
            
            if (this.currentSubstituteId) {
                // Update existing substitute
                await apiService.updateSubstitute(this.currentSubstituteId, { name, filePath });
            } else {
                // Create new substitute
                await apiService.createSubstitute({ name, filePath });
            }
            
            this.closeSubstituteModal();
            await this.loadSubstitutes();
        } catch (error) {
            showError('Failed to save substitute: ' + error.message);
        }
    }
    
    /**
     * Edit substitute
     * @param {object} substitute - Substitute data
     */
    editSubstitute(substitute) {
        this.openSubstituteModal(substitute);
    }
    
    /**
     * Delete substitute
     * @param {string} id - Substitute ID
     */
    async deleteSubstitute(id) {
        if (!confirm('Are you sure you want to delete this substitute?')) {
            return;
        }
        
        try {
            await apiService.deleteSubstitute(id);
            await this.loadSubstitutes();
        } catch (error) {
            showError('Failed to delete substitute: ' + error.message);
        }
    }
}

// Export singleton instance
const substitutesComponent = new SubstitutesComponent();
export default substitutesComponent;
