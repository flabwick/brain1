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

    // Move file or folder to a new location
    async moveFile(req, res) {
        try {
            const { sourcePath, targetPath } = req.body;
            
            if (!sourcePath || !targetPath) {
                return res.status(400).json({ error: 'Source path and target path are required' });
            }
            
            // Check if source file exists
            const sourceFile = await this.fileModel.getByPath(sourcePath);
            if (!sourceFile) {
                return res.status(404).json({ error: 'Source file not found' });
            }
            
            // Check if target folder exists
            const targetFolder = await this.fileModel.getByPath(targetPath);
            if (!targetFolder) {
                return res.status(404).json({ error: 'Target folder not found' });
            }
            
            // Make sure the target is a folder
            if (targetFolder.type !== 'folder') {
                return res.status(400).json({ error: 'Target must be a folder' });
            }
            
            // Create the new path for the moved file
            const fileName = sourcePath.split('/').pop();
            const newPath = targetPath === '/' ? `/${fileName}` : `${targetPath}/${fileName}`;
            
            // Check if file with new path already exists
            const existingFile = await this.fileModel.getByPath(newPath);
            if (existingFile) {
                return res.status(409).json({ error: 'A file with the same name already exists in the target folder' });
            }
            
            // Update the file's path and parentPath
            await this.fileModel.update(sourcePath, {
                path: newPath,
                parentPath: targetPath
            });
            
            // If it's a folder, update all children paths
            if (sourceFile.type === 'folder') {
                // Get all children
                const children = await this.fileModel.getByParentPath(sourcePath + '/');
                
                // Update each child's path
                for (const child of children) {
                    const newChildPath = child.path.replace(sourcePath, newPath);
                    const newParentPath = child.parentPath.replace(sourcePath, newPath);
                    
                    await this.fileModel.update(child.path, {
                        path: newChildPath,
                        parentPath: newParentPath
                    });
                }
            }
            
            res.status(200).json({ message: 'File moved successfully', newPath });
        } catch (error) {
            console.error('Error moving file:', error);
            res.status(500).json({ error: 'Failed to move file' });
        }
    }
}

module.exports = FileController;
