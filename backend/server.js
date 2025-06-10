const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
const dbName = 'fileSystem';
let db;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.md': 'text/plain',
    '.pdf': 'application/pdf',
    '.epub': 'application/epub+zip',
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API endpoints
    if (pathname.startsWith('/api/')) {
        await handleApiRequest(req, res, pathname, parsedUrl.query);
        return;
    }
    
    // Serve static frontend files
    const frontendPath = path.join(__dirname, '../frontend');
    let filePath;
    
    if (pathname === '/') {
        filePath = path.join(frontendPath, 'index.html');
    } else {
        filePath = path.join(frontendPath, pathname);
    }
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        const extname = path.extname(filePath);
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
                return;
            }
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        });
    });
});

// Handle API requests
async function handleApiRequest(req, res, pathname, query) {
    try {
        // Config endpoint - provides backend URL
        if (pathname === '/api/config') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ backendUrl: '' })); // Empty string means same-origin
            return;
        }
        
        // Files API
        if (pathname === '/api/files') {
            if (req.method === 'GET') {
                // Get all files and folders
                const files = await getAllFiles();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(files));
                return;
            } else if (req.method === 'POST') {
                // Create new file or folder
                let body = '';
                
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                
                req.on('end', async () => {
                    try {
                        const data = JSON.parse(body);
                        const result = await createFileOrFolder(data.type, data.name, data.parentPath);
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, result }));
                    } catch (error) {
                        console.error('Error in POST /api/files:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                });
                return;
            } else if (req.method === 'DELETE') {
                // Delete file or folder
                const path = query.path;
                
                if (!path) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Path parameter is required' }));
                    return;
                }
                
                try {
                    await deleteFileOrFolder(path);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (error) {
                    console.error('Error in DELETE /api/files:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
                return;
            }
        }
        
        // File content API
        if (pathname === '/api/files/content') {
            if (req.method === 'GET') {
                const path = query.path;
                
                if (!path) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Path parameter is required' }));
                    return;
                }
                
                try {
                    const content = await getFileContent(path);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, content }));
                } catch (error) {
                    console.error('Error in GET /api/files/content:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
                return;
            }
        }
        
        // File view API (for PDFs and EPUBs)
        if (pathname === '/api/files/view') {
            if (req.method === 'GET') {
                const path = query.path;
                
                if (!path) {
                    res.writeHead(400);
                    res.end('Path parameter is required');
                    return;
                }
                
                try {
                    const fileData = await getFileForViewing(path);
                    
                    if (path.endsWith('.pdf')) {
                        res.writeHead(200, { 'Content-Type': 'application/pdf' });
                        res.end(fileData);
                    } else if (path.endsWith('.epub')) {
                        res.writeHead(200, { 'Content-Type': 'application/epub+zip' });
                        res.end(fileData);
                    } else {
                        throw new Error('Unsupported file type for viewing');
                    }
                } catch (error) {
                    console.error('Error in GET /api/files/view:', error);
                    res.writeHead(500);
                    res.end('Error loading file for viewing');
                }
                return;
            }
        }
        
        // If no matching endpoint
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }));
    } catch (error) {
        console.error('Error in handleApiRequest:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
    }
}

// Database operations

// Get all files and folders
async function getAllFiles() {
    const filesCollection = db.collection('files');
    const files = await filesCollection.find({ parentPath: '' }).toArray();
    
    // Recursively get children for folders
    for (let i = 0; i < files.length; i++) {
        if (files[i].type === 'folder') {
            files[i].children = await getChildrenForFolder(files[i].path);
        }
    }
    
    return files;
}

// Get children for a folder
async function getChildrenForFolder(folderPath) {
    const filesCollection = db.collection('files');
    const children = await filesCollection.find({ parentPath: folderPath }).toArray();
    
    // Recursively get children for subfolders
    for (let i = 0; i < children.length; i++) {
        if (children[i].type === 'folder') {
            children[i].children = await getChildrenForFolder(children[i].path);
        }
    }
    
    return children;
}

// Create a new file or folder
async function createFileOrFolder(type, name, parentPath) {
    const filesCollection = db.collection('files');
    
    // Generate path
    const path = parentPath ? `${parentPath}/${name}` : name;
    
    // Check if file/folder with same name already exists
    const existingItem = await filesCollection.findOne({ path });
    if (existingItem) {
        throw new Error('A file or folder with this name already exists');
    }
    
    // Create the file/folder document
    const newItem = {
        name,
        type,
        path,
        parentPath: parentPath || '',
        content: type !== 'folder' ? '' : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    // Insert into database
    const result = await filesCollection.insertOne(newItem);
    return { ...newItem, _id: result.insertedId };
}

// Get file content
async function getFileContent(path) {
    const filesCollection = db.collection('files');
    const file = await filesCollection.findOne({ path });
    
    if (!file) {
        throw new Error('File not found');
    }
    
    if (file.type === 'folder') {
        throw new Error('Cannot get content of a folder');
    }
    
    return file.content || '';
}

// Get file for viewing (PDF/EPUB)
async function getFileForViewing(path) {
    const filesCollection = db.collection('files');
    const file = await filesCollection.findOne({ path });
    
    if (!file) {
        throw new Error('File not found');
    }
    
    if (file.type === 'folder') {
        throw new Error('Cannot view a folder');
    }
    
    // In a real app, you might store binary data in a different way
    // For now, we'll just return a placeholder
    return Buffer.from(file.content || '');
}

// Delete file or folder
async function deleteFileOrFolder(path) {
    const filesCollection = db.collection('files');
    
    const item = await filesCollection.findOne({ path });
    if (!item) {
        throw new Error('Item not found');
    }
    
    if (item.type === 'folder') {
        // Delete all children recursively
        await filesCollection.deleteMany({ path: { $regex: `^${path}/` } });
    }
    
    // Delete the item itself
    await filesCollection.deleteOne({ path });
}

// Connect to MongoDB and start server
async function startServer() {
    try {
        const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
        
        db = client.db(dbName);
        
        // Create indexes
        await db.collection('files').createIndex({ path: 1 }, { unique: true });
        await db.collection('files').createIndex({ parentPath: 1 });
        
        // Start server
        const port = process.env.BACKEND_PORT || 3001;
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB or start server:', error);
        process.exit(1);
    }
}

startServer();
