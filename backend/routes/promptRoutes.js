// Prompt routes
const express = require('express');
const PromptController = require('../controllers/promptController');

// Create router
const router = express.Router();

// Export route setup function
module.exports = (db) => {
    // Initialize controller with database connection
    const promptController = new PromptController(db);
    
    // GET all prompts
    router.get('/', (req, res) => promptController.getAllPrompts(req, res));
    
    // GET specific prompt by ID - using query parameter
    router.get('/prompt', (req, res) => promptController.getPrompt(req, res));
    
    // CREATE new prompt
    router.post('/', (req, res) => promptController.createPrompt(req, res));
    
    // UPDATE prompt - using query parameter
    router.put('/prompt', (req, res) => promptController.updatePrompt(req, res));
    
    // DELETE prompt - using query parameter
    router.delete('/prompt', (req, res) => promptController.deletePrompt(req, res));
    
    return router;
};
