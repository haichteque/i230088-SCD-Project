const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const fileDB = require('./db/file');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          menu();
        });
        break;

      case '5':
        rl.question('Enter search keyword: ', keyword => {
          const results = db.searchRecords(keyword);
          if (results.length === 0) {
            console.log('No records found.');
          } else {
            console.log(`Found ${results.length} matching records:`);
            results.forEach((r, index) => {
              console.log(`${index + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`);
            });
            // Displaying available fields as Created date is not in DB
          }
          menu();
        });
        break;

      case '6':
        rl.question('Choose field to sort by (Name/Creation Date): ', field => {
          const sortField = field.trim().toLowerCase();

          if (sortField !== 'name' && sortField !== 'creation date') {
            console.log('Invalid field. Please choose "Name" or "Creation Date".');
            menu();
            return;
          }

          rl.question('Choose order (Ascending/Descending): ', order => {
            const sortOrder = order.trim().toLowerCase();

            if (sortOrder !== 'ascending' && sortOrder !== 'descending') {
              console.log('Invalid order. Please choose "Ascending" or "Descending".');
              menu();
              return;
            }

            // Get a copy of records to avoid modifying the database
            const sortedRecords = [...db.listRecords()];

            if (sortedRecords.length === 0) {
              console.log('No records to sort.');
              menu();
              return;
            }

            // Sort based on field
            if (sortField === 'name') {
              sortedRecords.sort((a, b) => {
                const comparison = a.name.localeCompare(b.name);
                return sortOrder === 'ascending' ? comparison : -comparison;
              });
            } else { // creation date
              sortedRecords.sort((a, b) => {
                const comparison = a.id - b.id;
                return sortOrder === 'ascending' ? comparison : -comparison;
              });
            }

            console.log('\nSorted Records:');
            sortedRecords.forEach((r, index) => {
              console.log(`${index + 1}. ID: ${r.id} | Name: ${r.name}`);
            });

            menu();
          });
        });
        break;

      case '7':
        const exportRecords = db.listRecords();
        const exportDate = new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Karachi',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        let fileContent = `=====================================\n`;
        fileContent += `       NODEVAULT DATA EXPORT\n`;
        fileContent += `=====================================\n`;
        fileContent += `Export Date: ${exportDate}\n`;
        fileContent += `Total Records: ${exportRecords.length}\n`;
        fileContent += `File: export.txt\n`;
        fileContent += `=====================================\n\n`;
        fileContent += `RECORDS:\n\n`;

        if (exportRecords.length === 0) {
          fileContent += `No records found.\n`;
        } else {
          exportRecords.forEach((r, index) => {
            fileContent += `${index + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value}\n`;
          });
        }

        fileContent += `\n=====================================\n`;

        fs.writeFileSync('export.txt', fileContent, 'utf8');
        console.log('✅ Data exported successfully to export.txt.');
        menu();
        break;

      case '8':
        const statsRecords = db.listRecords();
        const totalRecords = statsRecords.length;

        console.log('\nVault Statistics:');
        console.log('--------------------------');
        console.log(`Total Records: ${totalRecords}`);

        // Get file modification time
        const fileStats = fileDB.getFileStats();
        if (fileStats) {
          const lastModified = new Date(fileStats.mtime);
          const formattedDate = lastModified.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          console.log(`Last Modified: ${formattedDate}`);
        }

        if (totalRecords > 0) {
          // Find longest name
          let longestName = statsRecords[0].name;
          let maxLength = longestName.length;

          for (const record of statsRecords) {
            if (record.name.length > maxLength) {
              longestName = record.name;
              maxLength = record.name.length;
            }
          }

          console.log(`Longest Name: ${longestName} (${maxLength} characters)`);

          // Find earliest and latest records (by ID timestamp)
          let earliestRecord = statsRecords[0];
          let latestRecord = statsRecords[0];

          for (const record of statsRecords) {
            if (record.id < earliestRecord.id) {
              earliestRecord = record;
            }
            if (record.id > latestRecord.id) {
              latestRecord = record;
            }
          }

          const earliestDate = new Date(earliestRecord.id).toISOString().split('T')[0];
          const latestDate = new Date(latestRecord.id).toISOString().split('T')[0];

          console.log(`Earliest Record: ${earliestDate}`);
          console.log(`Latest Record: ${latestDate}`);
        } else {
          console.log('Longest Name: N/A (no records)');
          console.log('Earliest Record: N/A');
          console.log('Latest Record: N/A');
        }

        menu();
        break;

      case '9':
        console.log('👋 Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();
