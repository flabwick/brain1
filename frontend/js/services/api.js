/**
 * API service for interacting with the backend
 */
class ApiService {
    constructor() {
        // Will be set during initialization
        this.backendUrl = '';
    }
    
    /**
     * Initialize the API service
     */
    async init() {
        // Use window._env_.BACKEND_URL if available
        if (window._env_ && window._env_.BACKEND_URL) {
            this.backendUrl = window._env_.BACKEND_URL;
            return this.backendUrl;
        }
        
        try {
            // First try to get the URL from the config endpoint
            try {
                const response = await fetch('/api/config');
                const config = await response.json();
                this.backendUrl = config.backendUrl;
                return this.backendUrl;
            } catch (configError) {
                // If we can't reach the config endpoint, use dynamic detection
                console.warn('Could not fetch config, attempting to auto-detect backend URL');
                // Use the same host as the frontend with environment-controlled port
                const host = window.location.hostname;
                
                if (window.ENV && window.ENV.PORT) {
                    console.log(`Using port from environment: ${window.ENV.PORT}`);
                    this.backendUrl = `http://${host}:${window.ENV.PORT}`;
                } else {
                    // Still try to make a request, might work if server is on the same origin
                    console.warn('No PORT environment variable found, attempting to use relative URLs');
                    this.backendUrl = '';
                }
                return this.backendUrl;
            }
        } catch (error) {
            console.error('Failed to initialize ApiService:', error);
            throw error;
        }
    }
    
    /**
     * Make API request
     * @param {string} endpoint - API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise<object>} - Response data
     */
    async request(endpoint, options = {}) {
        try {
            const url = this.backendUrl ? 
                `${this.backendUrl}/api${endpoint}` : 
                `/api${endpoint}`;
            
            const headers = {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            };
            
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || `API request failed with status ${response.status}`;
                } catch (e) {
                    // If we can't parse the error as JSON, use the status text
                    errorMessage = `API request failed: ${response.statusText} (${response.status})`;
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }
    
    // File API methods
    
    /**
     * Get file tree
     */
    async getFileTree() {
        return this.request('/files');
    }
    
    /**
     * Get file by path
     * @param {string} path - File path
     */
    async getFile(path) {
        return this.request(`/files/file?path=${encodeURIComponent(path)}`);
    }
    
    /**
     * Create new file or folder
     * @param {object} fileData - File data
     */
    async createFile(fileData) {
        return this.request('/files', {
            method: 'POST',
            body: JSON.stringify(fileData)
        });
    }
    
    /**
     * Update file content or metadata
     * @param {string} path - File path
     * @param {object} updateData - Update data
     */
    async updateFile(path, updateData) {
        return this.request(`/files/file?path=${encodeURIComponent(path)}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }
    
    /**
     * Delete file or folder
     * @param {string} path - File path
     */
    async deleteFile(path) {
        return this.request(`/files/file?path=${encodeURIComponent(path)}`, {
            method: 'DELETE'
        });
    }
    
    /**
     * Move a file or folder to a new location
     * @param {string} sourcePath - Path of the file/folder to move
     * @param {string} targetPath - Destination folder path
     * @returns {Promise<object>} - API response
     */
    async moveFileOrFolder(sourcePath, targetPath) {
        try {
            // Use the standard request method to ensure consistent error handling
            return await this.request('/files/move', {
                method: 'POST',
                body: JSON.stringify({
                    sourcePath,
                    targetPath
                })
            });
        } catch (error) {
            console.error('Move file/folder error:', error);
            throw error;
        }
    }
    
    // Prompt API methods
    
    /**
     * Get all prompts
     */
    async getAllPrompts() {
        return this.request('/prompts');
    }
    
    /**
     * Get prompt by ID
     * @param {string} id - Prompt ID
     */
    async getPrompt(id) {
        return this.request(`/prompts/prompt?id=${encodeURIComponent(id)}`);
    }
    
    /**
     * Create new prompt
     * @param {object} promptData - Prompt data
     */
    async createPrompt(promptData) {
        return this.request('/prompts', {
            method: 'POST',
            body: JSON.stringify(promptData)
        });
    }
    
    /**
     * Update prompt
     * @param {string} id - Prompt ID
     * @param {object} updateData - Update data
     */
    async updatePrompt(id, updateData) {
        return this.request(`/prompts/prompt?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }
    
    /**
     * Delete prompt
     * @param {string} id - Prompt ID
     */
    async deletePrompt(id) {
        return this.request(`/prompts/prompt?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    }
    
    // Substitute API methods
    
    /**
     * Get all substitutes
     */
    async getAllSubstitutes() {
        return this.request('/substitutes');
    }
    
    /**
     * Get substitute by ID
     * @param {string} id - Substitute ID
     */
    async getSubstitute(id) {
        return this.request(`/substitutes/substitute?id=${encodeURIComponent(id)}`);
    }
    
    /**
     * Create new substitute
     * @param {object} substituteData - Substitute data
     */
    async createSubstitute(substituteData) {
        return this.request('/substitutes', {
            method: 'POST',
            body: JSON.stringify(substituteData)
        });
    }
    
    /**
     * Update substitute
     * @param {string} id - Substitute ID
     * @param {object} updateData - Update data
     */
    async updateSubstitute(id, updateData) {
        return this.request(`/substitutes/substitute?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }
    
    /**
     * Delete substitute
     * @param {string} id - Substitute ID
     */
    async deleteSubstitute(id) {
        return this.request(`/substitutes/substitute?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
