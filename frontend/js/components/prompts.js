/**
 * Prompts management component
 */
import apiService from '../services/api.js';
import { showError } from '../utils/uiUtils.js';

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
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editPrompt(prompt);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePrompt(prompt._id);
            });
            
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
    viewPrompt(prompt) {
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
        
        // Replace current prompt view if exists
        const existingView = document.querySelector('.prompt-view');
        if (existingView) {
            existingView.replaceWith(promptView);
        } else {
            this.promptsList.parentElement.appendChild(promptView);
        }
    }
    
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
