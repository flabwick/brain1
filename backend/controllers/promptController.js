// Prompt controller - handles prompt-related operations
const PromptModel = require('../models/prompt');

class PromptController {
    constructor(db) {
        this.promptModel = new PromptModel(db);
    }

    // Get all prompts
    async getAllPrompts(req, res) {
        try {
            const prompts = await this.promptModel.getAll();
            res.status(200).json(prompts);
        } catch (error) {
            console.error('Error getting prompts:', error);
            res.status(500).json({ error: 'Failed to get prompts' });
        }
    }

    // Get a single prompt by ID
    async getPrompt(req, res) {
        try {
            const id = req.query.id;
            
            if (!id) {
                return res.status(400).json({ error: 'Prompt ID is required' });
            }
            
            const prompt = await this.promptModel.getById(id);
            
            if (!prompt) {
                return res.status(404).json({ error: 'Prompt not found' });
            }
            
            res.status(200).json(prompt);
        } catch (error) {
            console.error('Error getting prompt:', error);
            res.status(500).json({ error: 'Failed to get prompt' });
        }
    }

    // Create new prompt
    async createPrompt(req, res) {
        try {
            const promptData = req.body;
            
            if (!promptData.title || !promptData.text) {
                return res.status(400).json({ error: 'Prompt title and text are required' });
            }
            
            const newPrompt = await this.promptModel.create(promptData);
            res.status(201).json(newPrompt);
        } catch (error) {
            console.error('Error creating prompt:', error);
            res.status(500).json({ error: 'Failed to create prompt' });
        }
    }

    // Update prompt
    async updatePrompt(req, res) {
        try {
            const id = req.query.id;
            const updateData = req.body;
            
            if (!id) {
                return res.status(400).json({ error: 'Prompt ID is required' });
            }
            
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: 'Update data is required' });
            }
            
            const result = await this.promptModel.update(id, updateData);
            
            if (result.modifiedCount === 0) {
                return res.status(404).json({ error: 'Prompt not found or no changes made' });
            }
            
            res.status(200).json({ message: 'Prompt updated successfully' });
        } catch (error) {
            console.error('Error updating prompt:', error);
            res.status(500).json({ error: 'Failed to update prompt' });
        }
    }

    // Delete prompt
    async deletePrompt(req, res) {
        try {
            const id = req.query.id;
            
            if (!id) {
                return res.status(400).json({ error: 'Prompt ID is required' });
            }
            
            const result = await this.promptModel.delete(id);
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Prompt not found' });
            }
            
            res.status(200).json({ message: 'Prompt deleted successfully' });
        } catch (error) {
            console.error('Error deleting prompt:', error);
            res.status(500).json({ error: 'Failed to delete prompt' });
        }
    }
}

module.exports = PromptController;
