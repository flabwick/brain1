// File controller - handles file-related operations
const FileModel = require('../models/file');

class FileController {
    constructor(db) {
        this.fileModel = new FileModel(db);
    }

    // Get file tree structure
    async getFileTree(req, res) {
        try {
            const files = await this.fileModel.getAll();
            res.status(200).json(files);
        } catch (error) {
            console.error('Error getting file tree:', error);
            res.status(500).json({ error: 'Failed to get file tree' });
        }
    }

    // Get a single file by path
    async getFile(req, res) {
        try {
            const path = req.query.path;
            
            if (!path) {
                return res.status(400).json({ error: 'File path is required' });
            }
            
            const file = await this.fileModel.getByPath(path);
            
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            res.status(200).json(file);
        } catch (error) {
            console.error('Error getting file:', error);
            res.status(500).json({ error: 'Failed to get file' });
        }
    }

    // Create new file or folder
    async createFile(req, res) {
        try {
            const fileData = req.body;
            
            // Check if file with this path already exists
            const existingFile = await this.fileModel.getByPath(fileData.path);
            if (existingFile) {
                return res.status(409).json({ error: 'File or folder with this path already exists' });
            }
            
            const newFile = await this.fileModel.create(fileData);
            res.status(201).json(newFile);
        } catch (error) {
            console.error('Error creating file:', error);
            res.status(500).json({ error: 'Failed to create file' });
        }
    }

    // Update file content or metadata
    async updateFile(req, res) {
        try {
            const path = req.query.path;
            const updateData = req.body;
            
            if (!path) {
                return res.status(400).json({ error: 'File path is required' });
            }
            
            // Check if file exists
            const existingFile = await this.fileModel.getByPath(path);
            if (!existingFile) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            const result = await this.fileModel.update(path, updateData);
            
            if (result.modifiedCount === 0) {
                return res.status(404).json({ error: 'File not found or no changes made' });
            }
            
            res.status(200).json({ message: 'File updated successfully' });
        } catch (error) {
            console.error('Error updating file:', error);
            res.status(500).json({ error: 'Failed to update file' });
        }
    }

    // Delete file or folder
    async deleteFile(req, res) {
        try {
            const path = req.query.path;
            
            if (!path) {
                return res.status(400).json({ error: 'File path is required' });
            }
            
            // Check if file exists
            const file = await this.fileModel.getByPath(path);
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            // If it's a folder, delete all children
            if (file.type === 'folder') {
                await this.fileModel.deleteByParentPath(path + '/');
            }
            
            const result = await this.fileModel.delete(path);
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            res.status(200).json({ message: 'File deleted successfully' });
        } catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }
}

module.exports = FileController;
