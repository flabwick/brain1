// Server configuration constants
const path = require('path');

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

// Port configuration
const PORT = process.env.BACKEND_PORT || 3001;

// Frontend path
const FRONTEND_PATH = path.join(__dirname, '../../frontend');

// Express server configuration
const SERVER_CONFIG = {
    port: PORT,
    corsOptions: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};

module.exports = {
    mimeTypes,
    PORT,
    FRONTEND_PATH,
    SERVER_CONFIG
};
