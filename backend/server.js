// Main server entry point
const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
const dotenvPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: dotenvPath });

const { connectDB, closeDB } = require('./config/db');
const { PORT } = require('./config/server');

// Frontend path
const FRONTEND_PATH = path.join(__dirname, '../frontend');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from backend/public (for env-config.js and others)
app.use(express.static(path.join(__dirname, 'public')));

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Serve static frontend files
app.use(express.static(FRONTEND_PATH));

// Expose environment variables to the frontend
app.get('/env-config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`window.ENV = { PORT: ${process.env.PORT || 4021} };`);
});

// Save PID for later process management
fs.writeFileSync(path.join(__dirname, 'server.pid'), process.pid.toString());

// Initialize the server
async function initServer() {
    try {
        // Connect to database
        const db = await connectDB();

        // Ensure unique index on file paths
        await db.collection('files').createIndex({ path: 1 }, { unique: true });
        
        // Import controllers for direct routes
        const FileController = require('./controllers/fileController');
        const PromptController = require('./controllers/promptController');
        const SubstituteController = require('./controllers/substituteController');
        
        // Initialize controllers
        const fileController = new FileController(db);
        const promptController = new PromptController(db);
        const substituteController = new SubstituteController(db);
        
        // API Routes
        
        // Config endpoint
        app.get('/api/config', (req, res) => {
            const backendUrl = `http://localhost:${PORT}`;
            res.status(200).json({ backendUrl });
        });
        
        // File routes
        app.get('/api/files', (req, res) => fileController.getFileTree(req, res));
        app.get('/api/files/file', (req, res) => fileController.getFile(req, res));
        app.post('/api/files', (req, res) => fileController.createFile(req, res));
        app.put('/api/files/file', (req, res) => fileController.updateFile(req, res));
        app.delete('/api/files/file', (req, res) => fileController.deleteFile(req, res));
        app.post('/api/files/move', (req, res) => fileController.moveFile(req, res));
        
        // Prompt routes
        app.get('/api/prompts', (req, res) => promptController.getAllPrompts(req, res));
        app.get('/api/prompts/prompt', (req, res) => promptController.getPrompt(req, res));
        app.post('/api/prompts', (req, res) => promptController.createPrompt(req, res));
        app.put('/api/prompts/prompt', (req, res) => promptController.updatePrompt(req, res));
        app.delete('/api/prompts/prompt', (req, res) => promptController.deletePrompt(req, res));
        
        // Substitute routes
        app.get('/api/substitutes', (req, res) => substituteController.getAllSubstitutes(req, res));
        app.get('/api/substitutes/substitute', (req, res) => substituteController.getSubstitute(req, res));
        app.post('/api/substitutes', (req, res) => substituteController.createSubstitute(req, res));
        app.put('/api/substitutes/substitute', (req, res) => substituteController.updateSubstitute(req, res));
        app.delete('/api/substitutes/substitute', (req, res) => substituteController.deleteSubstitute(req, res));
        
        // Serve index.html for all other routes (SPA support)
        app.get('*', (req, res) => {
            res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
        });
        
        // Error handling middleware (should be last)
        app.use((err, req, res, next) => {
            console.error('Server error:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
        
        // Start server
        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
        
        // Handle graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('HTTP server closed');
                closeDB().then(() => {
                    console.log('Database connections closed');
                    process.exit(0);
                });
            });
        });
        
        process.on('SIGINT', async () => {
            console.log('SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('HTTP server closed');
                closeDB().then(() => {
                    console.log('Database connections closed');
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Initialize the server
initServer();