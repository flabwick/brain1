// File model functions
const { ObjectId } = require('mongodb');

/**
 * File schema structure for MongoDB:
 * {
 *   _id: ObjectId,        // MongoDB automatically generated ID
 *   name: String,         // Name of the file or folder
 *   type: String,         // 'folder', 'txt', 'md', 'pdf', 'epub'
 *   path: String,         // Full path to the file or folder, unique identifier
 *   parentPath: String,   // Path of parent folder, empty for root items
 *   content: String,      // Text content for txt/md files, binary data reference for pdf/epub
 *   createdAt: Date,      // Creation timestamp
 *   updatedAt: Date       // Last update timestamp
 * }
 */

class FileModel {
    constructor(db) {
        this.collection = db.collection('files');
    }

    /**
     * Get all files
     */
    async getAll() {
        return await this.collection.find().toArray();
    }

    /**
     * Get file by path
     * @param {string} path - File path
     */
    async getByPath(path) {
        return await this.collection.findOne({ path });
    }

    /**
     * Get files in a directory
     * @param {string} parentPath - Parent directory path
     */
    async getByParentPath(parentPath) {
        return await this.collection.find({ parentPath }).toArray();
    }

    /**
     * Create new file or folder
     * @param {object} fileData - File data
     */
    async create(fileData) {
        fileData.createdAt = new Date();
        fileData.updatedAt = new Date();
        const result = await this.collection.insertOne(fileData);
        return { ...fileData, _id: result.insertedId };
    }

    /**
     * Update file content or metadata
     * @param {string} path - File path
     * @param {object} updateData - Data to update
     */
    async update(path, updateData) {
        updateData.updatedAt = new Date();
        const result = await this.collection.updateOne(
            { path }, 
            { $set: updateData }
        );
        return result;
    }

    /**
     * Delete file or folder
     * @param {string} path - File path
     */
    async delete(path) {
        const result = await this.collection.deleteOne({ path });
        return result;
    }

    /**
     * Delete files in a directory
     * @param {string} parentPath - Parent directory path
     */
    async deleteByParentPath(parentPath) {
        const result = await this.collection.deleteMany({ 
            path: { $regex: new RegExp(`^${parentPath}`) } 
        });
        return result;
    }
}

module.exports = FileModel;
