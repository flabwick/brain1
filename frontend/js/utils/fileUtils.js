/**
 * File utilities
 */
import apiService from '../services/api.js';
import { showError } from './uiUtils.js';

/**
 * Resolve links in text by replacing them with file contents
 * @param {string} text - Text containing [[links]]
 * @returns {Promise<string>} - Text with resolved links
 */
export async function resolveLinksInText(text) {
    // Extract links using regex
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
        links.push(match[1]);
    }
    
    // No links to resolve
    if (links.length === 0) {
        return text;
    }
    
    let resolvedText = text;
    
    // Replace each link with its file content
    for (const link of links) {
        let content = null;
        
        try {
            // Check if it's a substitute or a file path
            if (link.indexOf('/') === -1) {
                // It's likely a substitute name
                const substitutes = await apiService.getAllSubstitutes();
                const substitute = substitutes.find(s => s.name === link);
                
                if (substitute) {
                    // Get the file content from the substitute's file path
                    try {
                        const file = await apiService.getFile(substitute.filePath);
                        content = file?.content || '';
                    } catch (fileErr) {
                        console.error(`Error fetching substitute file: ${substitute.filePath}`, fileErr);
                        // Leave link as is
                    }
                } else {
                    console.warn(`Substitute not found: ${link}`);
                    // Leave link as is
                }
            } else {
                // It's a file path, get content directly
                try {
                    const file = await apiService.getFile(link);
                    content = file?.content || '';
                } catch (fileErr) {
                    console.error(`Error fetching file: ${link}`, fileErr);
                    // Leave link as is
                }
            }
            
            // Replace link with content or leave as is if not found
            if (content) {
                resolvedText = resolvedText.replace(
                    new RegExp(`\\[\\[${link}\\]\\]`, 'g'), 
                    `{${content}}`
                );
            }
        } catch (err) {
            console.error(`Error resolving link ${link}:`, err);
            // Don't replace links that can't be resolved
        }
    }
    
    return resolvedText;
}

/**
 * Extract links from text
 * @param {string} text - Text containing [[links]]
 * @returns {Array} - Array of link strings
 */
export function extractLinks(text) {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
        links.push(match[1]);
    }
    
    return links;
}

/**
 * Check if a link is valid by attempting to fetch its content
 * @param {string} link - Link to check
 * @returns {Promise<Object>} - Object with isValid and message properties
 */
export async function validateLink(link) {
    try {
        // Check if it's a substitute or a file path
        if (link.indexOf('/') === -1) {
            // It's likely a substitute name
            const substitutes = await apiService.getAllSubstitutes();
            const substitute = substitutes.find(s => s.name === link);
            
            if (!substitute) {
                return { 
                    isValid: false, 
                    message: 'Substitute not found' 
                };
            }
            
            try {
                const file = await apiService.getFile(substitute.filePath);
                if (!file) {
                    return { 
                        isValid: false, 
                        message: 'Referenced file not found' 
                    };
                }
                
                if (!file.content) {
                    return { 
                        isValid: false, 
                        message: 'Referenced file is empty' 
                    };
                }
                
                return { 
                    isValid: true, 
                    message: `Points to: ${substitute.filePath}`,
                    content: file.content
                };
            } catch (err) {
                return { 
                    isValid: false, 
                    message: 'Error fetching referenced file' 
                };
            }
        } else {
            // It's a file path, check directly
            try {
                const file = await apiService.getFile(link);
                
                if (!file) {
                    return { 
                        isValid: false, 
                        message: 'File not found' 
                    };
                }
                
                if (!file.content) {
                    return { 
                        isValid: false, 
                        message: 'File is empty' 
                    };
                }
                
                return { 
                    isValid: true, 
                    message: 'File found',
                    content: file.content
                };
            } catch (err) {
                return { 
                    isValid: false, 
                    message: 'File not found' 
                };
            }
        }
    } catch (err) {
        return { 
            isValid: false, 
            message: `Error: ${err.message}` 
        };
    }
}
