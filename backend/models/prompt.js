// Prompt model functions
const { ObjectId } = require('mongodb');

/**
 * Prompt schema structure for MongoDB:
 * {
 *   _id: ObjectId,        // MongoDB automatically generated ID
 *   title: String,        // Title of the prompt
 *   text: String,         // Text content of the prompt, may include links like [[path/to/file]]
 *   createdAt: Date,      // Creation timestamp
 *   updatedAt: Date       // Last update timestamp
 * }
 */

class PromptModel {
    constructor(db) {
        this.collection = db.collection('prompts');
    }

    /**
     * Get all prompts
     */
    async getAll() {
        return await this.collection.find().sort({ updatedAt: -1 }).toArray();
    }

    /**
     * Get prompt by ID
     * @param {string} id - Prompt ID
     */
    async getById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    /**
     * Create new prompt
     * @param {object} promptData - Prompt data
     */
    async create(promptData) {
        promptData.createdAt = new Date();
        promptData.updatedAt = new Date();
        const result = await this.collection.insertOne(promptData);
        return { ...promptData, _id: result.insertedId };
    }

    /**
     * Update prompt
     * @param {string} id - Prompt ID
     * @param {object} updateData - Data to update
     */
    async update(id, updateData) {
        updateData.updatedAt = new Date();
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return result;
    }

    /**
     * Delete prompt
     * @param {string} id - Prompt ID
     */
    async delete(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result;
    }
}

module.exports = PromptModel;
