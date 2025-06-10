// Substitute model functions
const { ObjectId } = require('mongodb');

/**
 * Substitute schema structure for MongoDB:
 * {
 *   _id: ObjectId,        // MongoDB automatically generated ID
 *   name: String,         // Alias name used in prompts (e.g. "testfile")
 *   filePath: String,     // Actual file path (e.g. "testfolder/testfile1.txt")
 *   createdAt: Date,      // Creation timestamp
 *   updatedAt: Date       // Last update timestamp
 * }
 */

class SubstituteModel {
    constructor(db) {
        this.collection = db.collection('substitutes');
    }

    /**
     * Get all substitutes
     */
    async getAll() {
        return await this.collection.find().sort({ name: 1 }).toArray();
    }

    /**
     * Get substitute by ID
     * @param {string} id - Substitute ID
     */
    async getById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }

    /**
     * Get substitute by name
     * @param {string} name - Substitute name
     */
    async getByName(name) {
        return await this.collection.findOne({ name });
    }

    /**
     * Create new substitute
     * @param {object} substituteData - Substitute data
     */
    async create(substituteData) {
        substituteData.createdAt = new Date();
        substituteData.updatedAt = new Date();
        const result = await this.collection.insertOne(substituteData);
        return { ...substituteData, _id: result.insertedId };
    }

    /**
     * Update substitute
     * @param {string} id - Substitute ID
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
     * Delete substitute
     * @param {string} id - Substitute ID
     */
    async delete(id) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result;
    }
}

module.exports = SubstituteModel;
