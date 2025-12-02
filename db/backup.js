const fs = require('fs');
const path = require('path');

function createBackup(data) {
    try {
        // Create backups directory if it doesn't exist
        const backupsDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        // Generate timestamp for filename
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
        const filename = `backup_${timestamp}.json`;
        const filepath = path.join(backupsDir, filename);

        // Write backup file
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');

        return { success: true, filename };
    } catch (error) {
        console.error('Backup error:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { createBackup };
