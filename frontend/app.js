// DOM Elements
const fileTree = document.getElementById('fileTree');
const fileContent = document.getElementById('fileContent');
const createBtn = document.getElementById('createBtn');
const deleteBtn = document.getElementById('deleteBtn');
const createPanel = document.getElementById('createPanel');
const createOptions = document.querySelectorAll('.create-option');
const newItemNameInput = document.getElementById('newItemName');
const confirmCreateBtn = document.getElementById('confirmCreate');
const cancelCreateBtn = document.getElementById('cancelCreate');

// State
let currentSelectedItem = null;
let currentFileType = null;

// Backend URL (will be determined dynamically)
let backendUrl = '';

// Initialize the application
async function initApp() {
    try {
        // Fetch backend URL from server
        const response = await fetch('/api/config');
        const config = await response.json();
        backendUrl = config.backendUrl;
        
        // Load the file tree
        await loadFileTree();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize the application. Please reload the page.');
    }
}

// Load file tree from the backend
async function loadFileTree() {
    try {
        const response = await fetch(`${backendUrl}/api/files`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const files = await response.json();
        renderFileTree(files);
    } catch (error) {
        console.error('Error loading file tree:', error);
        showError('Failed to load the file tree. Please try again.');
    }
}

// Render file tree in the sidebar
function renderFileTree(items, parentElement = fileTree) {
    // Clear existing content
    parentElement.innerHTML = '';
    
    // Sort items: folders first, then files alphabetically
    items.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
    });
    
    items.forEach(item => {
        if (item.type === 'folder') {
            const folderEl = document.createElement('div');
            folderEl.className = 'tree-folder';
            folderEl.dataset.path = item.path;
            
            const folderHeader = document.createElement('div');
            folderHeader.className = 'tree-folder-header';
            folderHeader.dataset.path = item.path;
            
            const folderIcon = document.createElement('span');
            folderIcon.className = 'folder-icon';
            
            const folderName = document.createElement('span');
            folderName.textContent = item.name;
            
            folderHeader.appendChild(folderIcon);
            folderHeader.appendChild(folderName);
            folderEl.appendChild(folderHeader);
            
            const folderContent = document.createElement('div');
            folderContent.className = 'tree-folder-content';
            folderContent.style.display = 'none';
            
            if (item.children && item.children.length > 0) {
                renderFileTree(item.children, folderContent);
            }
            
            folderEl.appendChild(folderContent);
            parentElement.appendChild(folderEl);
            
            // Add click event to folder header
            folderHeader.addEventListener('click', function() {
                const content = this.parentElement.querySelector('.tree-folder-content');
                const icon = this.querySelector('.folder-icon');
                
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    icon.classList.add('open');
                } else {
                    content.style.display = 'none';
                    icon.classList.remove('open');
                }
            });
        } else {
            const fileEl = document.createElement('div');
            fileEl.className = 'tree-item';
            fileEl.dataset.path = item.path;
            fileEl.dataset.type = item.type;
            
            const fileIcon = document.createElement('span');
            fileIcon.className = `file-icon file-${item.type.toLowerCase()}`;
            
            const fileName = document.createElement('span');
            fileName.textContent = item.name;
            
            fileEl.appendChild(fileIcon);
            fileEl.appendChild(fileName);
            parentElement.appendChild(fileEl);
            
            // Add click event to file
            fileEl.addEventListener('click', function() {
                if (currentSelectedItem) {
                    currentSelectedItem.classList.remove('selected');
                }
                this.classList.add('selected');
                currentSelectedItem = this;
                loadFileContent(item.path, item.type);
            });
        }
    });
}

// Load file content when a file is clicked
async function loadFileContent(filePath, fileType) {
    try {
        const response = await fetch(`${backendUrl}/api/files/content?path=${encodeURIComponent(filePath)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayFileContent(data.content, fileType);
    } catch (error) {
        console.error('Error loading file content:', error);
        showError('Failed to load the file content.');
    }
}

// Display file content based on its type
function displayFileContent(content, fileType) {
    fileContent.innerHTML = '';
    
    switch (fileType.toLowerCase()) {
        case 'txt':
        case 'md':
            const textEl = document.createElement('div');
            textEl.className = 'file-content-text';
            textEl.textContent = content;
            
            if (fileType.toLowerCase() === 'md') {
                // Simple markdown rendering (for demonstration)
                // In a real app, you would use a markdown library
                textEl.innerHTML = renderSimpleMarkdown(content);
            }
            
            fileContent.appendChild(textEl);
            break;
        case 'pdf':
            const pdfFrame = document.createElement('iframe');
            pdfFrame.className = 'pdf-view';
            pdfFrame.src = `${backendUrl}/api/files/view?path=${encodeURIComponent(currentSelectedItem.dataset.path)}`;
            fileContent.appendChild(pdfFrame);
            break;
        case 'epub':
            const epubFrame = document.createElement('iframe');
            epubFrame.className = 'epub-view';
            epubFrame.src = `${backendUrl}/api/files/view?path=${encodeURIComponent(currentSelectedItem.dataset.path)}`;
            fileContent.appendChild(epubFrame);
            break;
        default:
            fileContent.innerHTML = '<div class="empty-state"><h2>Unsupported File Type</h2><p>This file type cannot be displayed.</p></div>';
    }
}

// Simple markdown rendering (very basic implementation)
function renderSimpleMarkdown(text) {
    // This is a very simplified markdown renderer
    // In a real app, use a proper markdown library
    
    // Headers
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Links
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    
    // Lists
    text = text.replace(/^\- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Paragraphs
    text = text.replace(/^(?!<[hl]|<ul|<li)(.+)$/gm, '<p>$1</p>');
    
    return text;
}

// Create button click event
createBtn.addEventListener('click', function() {
    if (createPanel.style.display === 'block') {
        createPanel.style.display = 'none';
    } else {
        createPanel.style.display = 'block';
        newItemNameInput.value = '';
        createOptions.forEach(option => option.classList.remove('active'));
        currentFileType = null;
    }
});

// Create option selection
createOptions.forEach(option => {
    option.addEventListener('click', function() {
        createOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        currentFileType = this.dataset.type;
        newItemNameInput.focus();
    });
});

// Confirm create button
confirmCreateBtn.addEventListener('click', async function() {
    if (!currentFileType) {
        alert('Please select a file type');
        return;
    }
    
    const itemName = newItemNameInput.value.trim();
    if (!itemName) {
        alert('Please enter a name');
        return;
    }
    
    // Determine parent path
    let parentPath = '';
    if (currentSelectedItem) {
        if (currentSelectedItem.classList.contains('tree-folder-header')) {
            parentPath = currentSelectedItem.dataset.path;
        } else if (currentSelectedItem.parentElement.classList.contains('tree-folder-content')) {
            // If a file is selected inside a folder, get the folder's path
            const folderHeader = currentSelectedItem.closest('.tree-folder').querySelector('.tree-folder-header');
            parentPath = folderHeader.dataset.path;
        }
    }
    
    try {
        const response = await fetch(`${backendUrl}/api/files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: currentFileType,
                name: itemName,
                parentPath: parentPath
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Reload file tree
        await loadFileTree();
        createPanel.style.display = 'none';
    } catch (error) {
        console.error('Error creating item:', error);
        showError('Failed to create the item.');
    }
});

// Cancel create button
cancelCreateBtn.addEventListener('click', function() {
    createPanel.style.display = 'none';
});

// Delete button click event
deleteBtn.addEventListener('click', async function() {
    if (!currentSelectedItem) {
        alert('Please select a file or folder to delete');
        return;
    }
    
    const path = currentSelectedItem.dataset.path;
    
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetch(`${backendUrl}/api/files?path=${encodeURIComponent(path)}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Clear file content if the deleted file was selected
        if (currentSelectedItem.classList.contains('tree-item')) {
            fileContent.innerHTML = '<div class="empty-state"><h2>No file selected</h2><p>Select a file from the sidebar to view its content</p></div>';
        }
        
        // Reset current selection
        currentSelectedItem = null;
        
        // Reload file tree
        await loadFileTree();
    } catch (error) {
        console.error('Error deleting item:', error);
        showError('Failed to delete the item.');
    }
});

// Show error message
function showError(message) {
    alert(message);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
