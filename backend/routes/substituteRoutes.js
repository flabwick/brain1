// Substitute routes
const express = require('express');
const SubstituteController = require('../controllers/substituteController');

// Create router
const router = express.Router();

// Export route setup function
module.exports = (db) => {
    // Initialize controller with database connection
    const substituteController = new SubstituteController(db);
    
    // GET all substitutes
    router.get('/', (req, res) => substituteController.getAllSubstitutes(req, res));
    
    // GET specific substitute by ID - using query parameter
    router.get('/substitute', (req, res) => substituteController.getSubstitute(req, res));
    
    // CREATE new substitute
    router.post('/', (req, res) => substituteController.createSubstitute(req, res));
    
    // UPDATE substitute - using query parameter
    router.put('/substitute', (req, res) => substituteController.updateSubstitute(req, res));
    
    // DELETE substitute - using query parameter
    router.delete('/substitute', (req, res) => substituteController.deleteSubstitute(req, res));
    
    return router;
};
