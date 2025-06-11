/**
 * File content component
 */
import apiService from '../services/api.js';
import { showError } from '../utils/uiUtils.js';

class FileContentComponent {
    constructor() {
        this.fileContentElement = document.getElementById('fileContent');
        this.currentFile = null;
    }
    
    /**
     * Load file content
     * @param {object} fileData - File data
     */
    async loadFileContent(fileData) {
        try {
            this.currentFile = fileData;
            
            // If it's a folder, show folder info
            if (fileData.type === 'folder') {
                this.showFolderInfo(fileData);
                return;
            }
            
            // If it's a file, show file content
            const file = await apiService.getFile(fileData.path);
            this.showFileContent(file);
        } catch (error) {
            showError('Failed to load file content: ' + error.message);
        }
    }
    
    /**
     * Show folder info
     * @param {object} folderData - Folder data
     */
    showFolderInfo(folderData) {
        this.fileContentElement.innerHTML = '';
        
        const folderInfo = document.createElement('div');
        folderInfo.className = 'folder-info';
        
        const title = document.createElement('h2');
        title.textContent = `Folder: ${folderData.name}`;
        
        const path = document.createElement('p');
        path.textContent = `Path: ${folderData.path}`;
        
        folderInfo.appendChild(title);
        folderInfo.appendChild(path);
        
        this.fileContentElement.appendChild(folderInfo);
    }
    
    /**
     * Show file content
     * @param {object} fileData - File data
     */
    showFileContent(fileData) {
        this.fileContentElement.innerHTML = '';

        const fileHeader = document.createElement('div');
        fileHeader.className = 'file-header';
        const title = document.createElement('h2');
        title.textContent = fileData.name;
        const path = document.createElement('p');
        path.className = 'file-path';
        path.textContent = fileData.path;
        fileHeader.appendChild(title);
        fileHeader.appendChild(path);
        this.fileContentElement.appendChild(fileHeader);

        // Always use whole file editor for txt and md
        if (fileData.type === 'md' || fileData.type === 'txt') {
            this.renderWholeFileEditor(fileData);
        } else if (fileData.type === 'pdf' || fileData.type === 'epub') {
            this.renderBinaryContent(fileData);
        } else {
            this.fileContentElement.innerHTML += '<p>Unsupported file type</p>';
        }
    }

    /**
     * Render whole file editor for txt/md
     */
    renderWholeFileEditor(fileData) {
        const contentContainer = document.createElement('div');
        contentContainer.className = 'file-content-text whole-file-editor';
        let editing = false;

        // Display mode
        const showText = () => {
            contentContainer.innerText = fileData.content || '';
            contentContainer.setAttribute('contenteditable', 'false');
            contentContainer.style.whiteSpace = 'pre-wrap';
        };
        showText();

        // On click, switch to textarea for editing
        contentContainer.addEventListener('click', (e) => {
            if (!editing) {
                editing = true;
                const textarea = document.createElement('textarea');
                textarea.className = 'whole-file-textarea';
                textarea.value = fileData.content || '';
                textarea.style.width = '100%';
                textarea.style.height = Math.max(200, contentContainer.offsetHeight) + 'px';
                textarea.style.fontFamily = 'monospace';
                textarea.style.fontSize = '1em';
                textarea.style.padding = '16px';
                textarea.style.boxSizing = 'border-box';
                textarea.style.border = '1px solid #4285f4';
                textarea.style.borderRadius = '4px';
                textarea.style.background = '#f8fafc';
                textarea.style.resize = 'vertical';
                contentContainer.innerHTML = '';
                contentContainer.appendChild(textarea);
                textarea.focus();
                textarea.setSelectionRange(textarea.value.length, textarea.value.length);

                // On blur, save and return to display mode
                textarea.addEventListener('blur', async () => {
                    editing = false;
                    const newContent = textarea.value;
                    if (newContent !== fileData.content) {
                        try {
                            await this.saveFileContent(fileData.path, newContent);
                            fileData.content = newContent;
                        } catch (error) {
                            showError('Failed to save file: ' + error.message);
                        }
                    }
                    showText();
                });
            }
        });

        this.fileContentElement.appendChild(contentContainer);
    }
    
    /**
     * Save file content
     * @param {string} path - File path
     * @param {string} content - New content
     */
    async saveFileContent(path, content) {
        try {
            await apiService.updateFile(path, { content });
        } catch (error) {
            showError('Failed to save file: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Render binary content
     * @param {object} fileData - File data
     */
    renderBinaryContent(fileData) {
        const contentContainer = document.createElement('div');
        contentContainer.className = 'file-content-binary';
        
        const message = document.createElement('p');
        message.textContent = `This binary file (${fileData.type}) cannot be displayed directly.`;
        
        contentContainer.appendChild(message);
        
        this.fileContentElement.appendChild(contentContainer);
    }
}

// Export singleton instance
const fileContentComponent = new FileContentComponent();
export default fileContentComponent;
