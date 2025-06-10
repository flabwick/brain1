// Database configuration
const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const dotenvPath = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: dotenvPath });

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
const dbName = 'fileSystem';

let client;
let db;

/**
 * Connect to MongoDB
 */
async function connectDB() {
    if (db) return db;
    
    try {
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('Connected to MongoDB');
        
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

/**
 * Close MongoDB connection
 */
async function closeDB() {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

module.exports = {
    connectDB,
    closeDB
};
