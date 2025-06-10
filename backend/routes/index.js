// Main router file that combines all routes
const express = require('express');
const fileRoutes = require('./fileRoutes');
const promptRoutes = require('./promptRoutes');
const substituteRoutes = require('./substituteRoutes');

// Create main router
const router = express.Router();

// Export route setup function
module.exports = (db) => {
    // Set up API routes
    router.use('/files', fileRoutes(db));
    router.use('/prompts', promptRoutes(db));
    router.use('/substitutes', substituteRoutes(db));
    
    // Config endpoint - provides backend URL
    router.get('/config', (req, res) => {
        const backendPort = process.env.PORT || 3001;
        const backendUrl = `http://localhost:${backendPort}`;
        res.status(200).json({ backendUrl });
    });
    
    return router;
};
