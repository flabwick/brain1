/**
 * Prompts management component
 */
import apiService from '../services/api.js';
import { showError, showSuccess } from '../utils/uiUtils.js';
import { resolveLinksInText, extractLinks, validateLink } from '../utils/fileUtils.js';

class PromptsComponent {
    constructor() {
        // DOM Elements
        this.promptsView = document.getElementById('promptsView');
        this.promptsList = document.getElementById('promptsList');
        this.createPromptBtn = document.getElementById('createPromptBtn');
        this.promptModal = document.getElementById('promptModal');
        this.promptModalTitle = document.getElementById('promptModalTitle');
        this.promptTitle = document.getElementById('promptTitle');
        this.promptText = document.getElementById('promptText');
        this.savePromptBtn = document.getElementById('savePromptBtn');
        this.cancelPromptBtn = document.getElementById('cancelPromptBtn');
        
        this.currentPromptId = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the component
     */
    init() {
        // Create prompt button opens the prompt modal
        this.createPromptBtn.addEventListener('click', () => {
            this.openPromptModal();
        });
        
        // Save prompt button
        this.savePromptBtn.addEventListener('click', () => {
            this.savePrompt();
        });
        
        // Cancel prompt button
        this.cancelPromptBtn.addEventListener('click', () => {
            this.closePromptModal();
        });
    }
    
    /**
     * Load all prompts
     */
    async loadPrompts() {
        try {
            const prompts = await apiService.getAllPrompts();
            this.renderPromptsList(prompts);
        } catch (error) {
            showError('Failed to load prompts: ' + error.message);
        }
    }
    
    /**
     * Render prompts list
     * @param {Array} prompts - Array of prompt objects
     */
    renderPromptsList(prompts) {
        this.promptsList.innerHTML = '';
        
        if (prompts.length === 0) {
            const noPrompts = document.createElement('p');
            noPrompts.textContent = 'No prompts found. Create one!';
            this.promptsList.appendChild(noPrompts);
            return;
        }
        
        prompts.forEach(prompt => {
            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item';
            promptItem.dataset.id = prompt._id;
            
            const title = document.createElement('h3');
            title.textContent = prompt.title;
            
            const timestamp = document.createElement('p');
            timestamp.className = 'prompt-timestamp';
            timestamp.textContent = new Date(prompt.updatedAt).toLocaleString();
            
            const actions = document.createElement('div');
            actions.className = 'prompt-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyPromptToClipboard(prompt);
            });
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg> Edit';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editPrompt(prompt);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePrompt(prompt._id);
            });
            
            actions.appendChild(copyBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            promptItem.appendChild(title);
            promptItem.appendChild(timestamp);
            promptItem.appendChild(actions);
            
            // Click on prompt item shows prompt content
            promptItem.addEventListener('click', () => {
                this.viewPrompt(prompt);
            });
            
            this.promptsList.appendChild(promptItem);
        });
    }
    
    /**
     * View prompt
     * @param {object} prompt - Prompt data
     */
    async viewPrompt(prompt) {
        // Deselect all prompts
        document.querySelectorAll('.prompt-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Select this prompt
        const promptItem = document.querySelector(`.prompt-item[data-id="${prompt._id}"]`);
        if (promptItem) {
            promptItem.classList.add('selected');
        }
        
        // Create prompt view
        const promptView = document.createElement('div');
        promptView.className = 'prompt-view';
        
        const title = document.createElement('h2');
        title.textContent = prompt.title;
        
        const timestamp = document.createElement('p');
        timestamp.className = 'prompt-timestamp';
        timestamp.textContent = `Last updated: ${new Date(prompt.updatedAt).toLocaleString()}`;
        
        const text = document.createElement('div');
        text.className = 'prompt-text';
        text.innerHTML = this.processPromptText(prompt.text);
        
        promptView.appendChild(title);
        promptView.appendChild(timestamp);
        promptView.appendChild(text);
        
        // Extract and display links
        const links = extractLinks(prompt.text);
        if (links.length > 0) {
            const linksSection = document.createElement('div');
            linksSection.className = 'prompt-links-list';
            
            const linksTitle = document.createElement('h3');
            linksTitle.textContent = 'Referenced Files:';
            linksSection.appendChild(linksTitle);
            
            const linksList = document.createElement('ul');
            
            // Fetch file content to validate links
            for (const link of links) {
                const linkItem = document.createElement('li');
                linkItem.className = 'prompt-link-item';
                
                // Use our validation utility
                const validation = await validateLink(link);
                
                if (validation.isValid) {
                    if (link.indexOf('/') === -1) {
                        // It's a substitute
                        const substitutes = await apiService.getAllSubstitutes();
                        const substitute = substitutes.find(s => s.name === link);
                        linkItem.innerHTML = `<span class="file-link">${link}</span> → <small>${substitute.filePath}</small>`;
                    } else {
                        linkItem.innerHTML = `<span class="file-link">${link}</span>`;
                    }
                } else {
                    linkItem.innerHTML = `<span class="file-link error">${link}</span> <small>(${validation.message})</small>`;
                    linkItem.classList.add('error');
                }
                
                linksList.appendChild(linkItem);
            }
            
            linksSection.appendChild(linksList);
            promptView.appendChild(linksSection);
        }
        
        // Replace current prompt view if exists
        const existingView = document.querySelector('.prompt-view');
        if (existingView) {
            existingView.replaceWith(promptView);
        } else {
            this.promptsList.parentElement.appendChild(promptView);
        }
    }
    
    // Using extractLinks from fileUtils.js
    
    /**
     * Process prompt text to handle substitutes and formatting
     * @param {string} text - Raw prompt text
     * @returns {string} - Processed HTML
     */
    processPromptText(text) {
        // Replace [[path/to/file]] links
        return text.replace(/\[\[([^\]]+)\]\]/g, '<a href="#" class="file-link">$1</a>');
    }
    
    /**
     * Copy prompt to clipboard with resolved file content
     * @param {object} prompt - Prompt to copy
     */
    async copyPromptToClipboard(prompt) {
        try {
            // Use the utility function to resolve all links in the text
            const resolvedText = await resolveLinksInText(prompt.text);
            
            // Copy to clipboard
            await navigator.clipboard.writeText(resolvedText);
            
            // Show success message
            showSuccess('Prompt copied to clipboard!');
            
        } catch (error) {
            showError('Failed to copy prompt: ' + error.message);
        }
    }
    
    /**
     * Open prompt modal for creation or editing
     * @param {object} prompt - Prompt data for editing (optional)
     */
    openPromptModal(prompt = null) {
        if (prompt) {
            this.promptModalTitle.textContent = 'Edit Prompt';
            this.promptTitle.value = prompt.title;
            this.promptText.value = prompt.text;
            this.currentPromptId = prompt._id;
        } else {
            this.promptModalTitle.textContent = 'Create Prompt';
            this.promptTitle.value = '';
            this.promptText.value = '';
            this.currentPromptId = null;
        }
        
        this.promptModal.style.display = 'block';
    }
    
    /**
     * Close prompt modal
     */
    closePromptModal() {
        this.promptModal.style.display = 'none';
    }
    
    /**
     * Save prompt (create or update)
     */
    async savePrompt() {
        try {
            const title = this.promptTitle.value.trim();
            const text = this.promptText.value.trim();
            
            if (!title || !text) {
                showError('Title and text are required');
                return;
            }
            
            if (this.currentPromptId) {
                // Update existing prompt
                await apiService.updatePrompt(this.currentPromptId, { title, text });
            } else {
                // Create new prompt
                await apiService.createPrompt({ title, text });
            }
            
            this.closePromptModal();
            await this.loadPrompts();
        } catch (error) {
            showError('Failed to save prompt: ' + error.message);
        }
    }
    
    /**
     * Edit prompt
     * @param {object} prompt - Prompt data
     */
    editPrompt(prompt) {
        this.openPromptModal(prompt);
    }
    
    /**
     * Delete prompt
     * @param {string} id - Prompt ID
     */
    async deletePrompt(id) {
        if (!confirm('Are you sure you want to delete this prompt?')) {
            return;
        }
        
        try {
            await apiService.deletePrompt(id);
            await this.loadPrompts();
            
            // Remove prompt view if it was the deleted prompt
            const existingView = document.querySelector('.prompt-view');
            if (existingView && document.querySelector(`.prompt-item.selected[data-id="${id}"]`)) {
                existingView.remove();
            }
        } catch (error) {
            showError('Failed to delete prompt: ' + error.message);
        }
    }
}

// Export singleton instance
const promptsComponent = new PromptsComponent();
export default promptsComponent;
