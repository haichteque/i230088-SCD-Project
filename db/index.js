const recordUtils = require('./record');
const vaultEvents = require('../events');
const backup = require('./backup');
const mongo = require('./mongo');

let db;

// Initialize MongoDB connection
async function initDB() {
  db = await mongo.connectDB();
}

async function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const newRecord = { id: recordUtils.generateId(), name, value };

  await db.collection('records').insertOne(newRecord);
  vaultEvents.emit('recordAdded', newRecord);

  // Create automatic backup
  const allRecords = await listRecords();
  const backupResult = backup.createBackup(allRecords);
  if (backupResult.success) {
    console.log(`💾 Backup created: ${backupResult.filename}`);
  }

  return newRecord;
}

async function listRecords() {
  const records = await db.collection('records').find({}).toArray();
  return records;
}

async function updateRecord(id, newName, newValue) {
  const result = await db.collection('records').findOneAndUpdate(
    { id: id },
    { $set: { name: newName, value: newValue } },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  vaultEvents.emit('recordUpdated', result);
  return result;
}

async function deleteRecord(id) {
  const record = await db.collection('records').findOne({ id: id });
  if (!record) return null;

  await db.collection('records').deleteOne({ id: id });
  vaultEvents.emit('recordDeleted', record);

  // Create automatic backup
  const allRecords = await listRecords();
  const backupResult = backup.createBackup(allRecords);
  if (backupResult.success) {
    console.log(`💾 Backup created: ${backupResult.filename}`);
  }

  return record;
}

async function searchRecords(query) {
  const lowerQuery = query.toLowerCase();

  // Search by name (case-insensitive) or exact ID match
  const records = await db.collection('records').find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { id: parseInt(query) || 0 }
    ]
  }).toArray();

  return records;
}

module.exports = { initDB, addRecord, listRecords, updateRecord, deleteRecord, searchRecords };
