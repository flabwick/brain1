// Substitute controller - handles substitute-related operations
const SubstituteModel = require('../models/substitute');

class SubstituteController {
    constructor(db) {
        this.substituteModel = new SubstituteModel(db);
    }

    // Get all substitutes
    async getAllSubstitutes(req, res) {
        try {
            const substitutes = await this.substituteModel.getAll();
            res.status(200).json(substitutes);
        } catch (error) {
            console.error('Error getting substitutes:', error);
            res.status(500).json({ error: 'Failed to get substitutes' });
        }
    }

    // Get a single substitute by ID
    async getSubstitute(req, res) {
        try {
            const id = req.query.id;
            
            if (!id) {
                return res.status(400).json({ error: 'Substitute ID is required' });
            }
            
            const substitute = await this.substituteModel.getById(id);
            
            if (!substitute) {
                return res.status(404).json({ error: 'Substitute not found' });
            }
            
            res.status(200).json(substitute);
        } catch (error) {
            console.error('Error getting substitute:', error);
            res.status(500).json({ error: 'Failed to get substitute' });
        }
    }

    // Create new substitute
    async createSubstitute(req, res) {
        try {
            const substituteData = req.body;
            
            if (!substituteData.name || !substituteData.filePath) {
                return res.status(400).json({ error: 'Substitute name and filePath are required' });
            }
            
            // Check if substitute with this name already exists
            const existingSubstitute = await this.substituteModel.getByName(substituteData.name);
            if (existingSubstitute) {
                return res.status(409).json({ error: 'Substitute with this name already exists' });
            }
            
            const newSubstitute = await this.substituteModel.create(substituteData);
            res.status(201).json(newSubstitute);
        } catch (error) {
            console.error('Error creating substitute:', error);
            res.status(500).json({ error: 'Failed to create substitute' });
        }
    }

    // Update substitute
    async updateSubstitute(req, res) {
        try {
            const id = req.query.id;
            const updateData = req.body;
            
            if (!id) {
                return res.status(400).json({ error: 'Substitute ID is required' });
            }
            
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: 'Update data is required' });
            }
            
            // If name is being updated, check if it conflicts with an existing substitute
            if (updateData.name) {
                const existingSubstitute = await this.substituteModel.getByName(updateData.name);
                if (existingSubstitute && existingSubstitute._id.toString() !== id) {
                    return res.status(409).json({ error: 'Substitute with this name already exists' });
                }
            }
            
            const result = await this.substituteModel.update(id, updateData);
            
            if (result.modifiedCount === 0) {
                return res.status(404).json({ error: 'Substitute not found or no changes made' });
            }
            
            res.status(200).json({ message: 'Substitute updated successfully' });
        } catch (error) {
            console.error('Error updating substitute:', error);
            res.status(500).json({ error: 'Failed to update substitute' });
        }
    }

    // Delete substitute
    async deleteSubstitute(req, res) {
        try {
            const id = req.query.id;
            
            if (!id) {
                return res.status(400).json({ error: 'Substitute ID is required' });
            }
            
            const result = await this.substituteModel.delete(id);
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Substitute not found' });
            }
            
            res.status(200).json({ message: 'Substitute deleted successfully' });
        } catch (error) {
            console.error('Error deleting substitute:', error);
            res.status(500).json({ error: 'Failed to delete substitute' });
        }
    }
}

module.exports = SubstituteController;
