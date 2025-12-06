# NodeVault

A command-line interface (CLI) application for managing records with MongoDB persistence. NodeVault provides a simple yet powerful way to store, search, and manage your data with automatic backup functionality.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, and Delete records
- 🔍 **Search**: Find records by name or ID using keyword search
- 📊 **Sorting**: Sort records by name or creation date (ascending/descending)
- 📤 **Export**: Export all data to a formatted text file
- 📈 **Statistics**: View vault statistics including total records, longest name, and date ranges
- 💾 **Auto Backup**: Automatic timestamped backups on record additions/deletions
- 🗄️ **MongoDB**: Persistent data storage using MongoDB

## Prerequisites

### For Local Development
- **Node.js** 18 or higher
- **MongoDB** running on `localhost:27017`
- **npm** (comes with Node.js)

### For Docker Deployment
- **Docker** and **Docker Compose**

## Installation & Setup

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SCDProject25
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   The `.env` file should contain:
   ```env
   MONGO_URI=mongodb://localhost:27017
   DB_NAME=nodevault
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If you have MongoDB installed locally:
   ```bash
   mongod
   ```
   
   Or use the provided installation script (Linux only):
   ```bash
   chmod +x install_mongodb.sh
   ./install_mongodb.sh
   ```

5. **Run the application**
   ```bash
   node main.js
   ```

### Option 2: Docker Deployment

1. **Set up environment variables**
   
   Ensure your `.env` file exists with the database name:
   ```env
   DB_NAME=nodevault
   ```
   
   > **Note**: The MongoDB URI is configured in `docker-compose.yml` to connect to the MongoDB container.

2. **Build and start containers**
   ```bash
   docker-compose up --build -d
   ```
   
   This will:
   - Create a MongoDB container with persistent storage
   - Build and start the NodeVault backend container
   - Set up a custom bridge network for inter-container communication

3. **Access the application**
   
   Attach to the backend container to interact with NodeVault:
   ```bash
   docker attach backend
   ```
   
   Or execute a new session:
   ```bash
   docker exec -it backend node main.js
   ```

4. **View logs**
   ```bash
   docker logs backend
   ```

5. **Stop containers**
   ```bash
   docker-compose down
   ```

## Usage

Once the application is running, you'll see the main menu:

```
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
```

### Menu Options

1. **Add Record**: Create a new record with name and value
2. **List Records**: Display all records in the vault
3. **Update Record**: Modify an existing record by ID
4. **Delete Record**: Remove a record by ID (creates automatic backup)
5. **Search Records**: Find records by keyword (searches name and ID)
6. **Sort Records**: Sort by name or creation date in ascending/descending order
7. **Export Data**: Export all records to `export.txt` with formatted output
8. **View Vault Statistics**: See total records, last modified date, longest name, and date ranges
9. **Exit**: Close the application and disconnect from MongoDB

## Project Structure

```
SCDProject25/
├── db/
│   ├── index.js          # Database interface
│   ├── mongo.js          # MongoDB connection
│   ├── backup.js         # Backup functionality
│   └── file.js           # Legacy file-based storage
├── events/
│   └── logger.js         # Event logging
├── backups/              # Auto-generated backup files
├── main.js               # Application entry point
├── Dockerfile            # Docker image configuration
├── docker-compose.yml    # Multi-container setup
├── .env                  # Environment variables (gitignored)
├── .env.example          # Example environment file
└── package.json          # Node.js dependencies
```

## Docker Architecture

The Docker deployment uses two services:

- **mongo**: MongoDB 5.0 container with persistent volume
- **backend**: NodeVault application container

Both containers run on a custom bridge network (`scd-network`) allowing them to communicate using service names as hostnames.

### Why Docker Containers Were Crashing

If you experience container crashes, it's typically because:
- The backend tries to connect to `localhost:27017`, but in Docker, `localhost` refers to the container itself
- Solution: Use the service name `mongo` as the hostname in `docker-compose.yml`
- The docker-compose configuration correctly sets `MONGO_URI=mongodb://mongo:27017`

## Environment Variables

| Variable    | Description                  | Default                                                                 |
| ----------- | ---------------------------- | ----------------------------------------------------------------------- |
| `MONGO_URI` | MongoDB connection string    | `mongodb://localhost:27017` (local)<br>`mongodb://mongo:27017` (Docker) |
| `DB_NAME`   | Name of the MongoDB database | `nodevault`                                                             |

## Backup System

NodeVault automatically creates timestamped backups in the `backups/` directory when:
- Adding a new record
- Deleting a record

Backup filename format: `backup_YYYYMMDD_HHMMSS.json`

## Export Format

Exported data is saved to `export.txt` with the following format:

```
=====================================
       NODEVAULT DATA EXPORT
=====================================
Export Date: MM/DD/YYYY, HH:MM:SS AM/PM
Total Records: X
File: export.txt
=====================================

RECORDS:

1. ID: 1234567890 | Name: Example | Value: Data
2. ID: 1234567891 | Name: Test | Value: Info

=====================================
```

## Troubleshooting

### MongoDB Connection Error (Local)
```
❌ MongoDB connection error: connect ECONNREFUSED
```
**Solution**: Ensure MongoDB is running on `localhost:27017`

### Docker Container Crashes
```
Failed to start application: connect ECONNREFUSED
```
**Solution**: Verify `docker-compose.yml` uses `MONGO_URI=mongodb://mongo:27017` and not `localhost`

### Permission Issues (Linux)
```bash
sudo chown -R $USER:$USER .
```

## License

This project is part of an SCD (Software Construction and Development) course assignment.

## Author

**haichteque** (i230088)
