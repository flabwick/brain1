// File routes
const express = require('express');
const FileController = require('../controllers/fileController');

// Create router
const router = express.Router();

// Export route setup function
module.exports = (db) => {
    // Initialize controller with database connection
    const fileController = new FileController(db);
    
    // GET file tree
    router.get('/', (req, res) => fileController.getFileTree(req, res));
    
    // GET specific file by path - using query parameter instead
    router.get('/file', (req, res) => {
        fileController.getFile(req, res);
    });
    
    // CREATE new file or folder
    router.post('/', (req, res) => fileController.createFile(req, res));
    
    // UPDATE file content or metadata - using query parameter
    router.put('/file', (req, res) => {
        fileController.updateFile(req, res);
    });
    
    // DELETE file or folder - using query parameter
    router.delete('/file', (req, res) => {
        fileController.deleteFile(req, res);
    });
    
    // MOVE file or folder
    router.post('/move', (req, res) => {
        fileController.moveFile(req, res);
    });
    
    return router;
};
