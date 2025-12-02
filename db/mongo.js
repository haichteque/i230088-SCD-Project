const { MongoClient } = require('mongodb');

// Hardcoded connection string
const uri = 'mongodb://localhost:27017';
const dbName = 'nodevault';

let client = null;
let db = null;

async function connectDB() {
    try {
        if (client && client.topology && client.topology.isConnected()) {
            return db;
        }

        client = new MongoClient(uri);
        await client.connect();
        console.log('✅ Connected to MongoDB');

        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
}

async function closeDB() {
    if (client) {
        await client.close();
        console.log('🔌 MongoDB connection closed');
    }
}

module.exports = { connectDB, getDB, closeDB };
