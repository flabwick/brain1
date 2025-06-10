# Quick Start Guide

This guide provides steps to get the application up and running quickly.

## Prerequisites

1. Node.js (v14 or later)
2. MongoDB (v4.4 or later)
3. Modern web browser (Chrome, Firefox, Edge, or Safari)

## Installation

### 1. Clone the repository (if you haven't already)

```bash
git clone <repository-url>
cd brain-dev
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following content:

```
MONGODB_URI=mongodb://localhost:27017/fileSystem
PORT=3001
```

Adjust the MongoDB URI and port as needed for your environment.

### 4. Starting the application

#### Start MongoDB (if not running as a service)

```bash
mongod --dbpath /path/to/data/directory
```

#### Start the backend server

```bash
cd backend
PORT=4021 node server.js
```

You should see output indicating that the server is running at http://localhost:4021 and that the MongoDB connection is established.

#### Access the application

Open `frontend/index.html` in your web browser, or serve the frontend using a tool like:

```bash
cd frontend
npx serve
```

Then access the application at http://localhost:5000 (or whatever port the serve command indicates).

## Usage

### File Management

1. Click on the "Files" tab to manage your files and folders.
2. Use the "Create" button to create new files or folders.
3. Select a file to view or edit its content.
4. Use the "Delete" button to remove selected files or folders.

### Prompts Management

1. Click on the "Prompts" tab to manage your prompts.
2. Use the "Create New Prompt" button to create a new prompt.
3. Enter a title and text for your prompt.
4. To edit a prompt, click the "Edit" button next to it.
5. To delete a prompt, click the "Delete" button next to it.

### Substitutes Management

1. In the "Prompts" tab, scroll down to the "Substitutes" section.
2. Use the "Create New Substitute" button to create a new substitute.
3. Enter a name and select a file path for your substitute.
4. To edit a substitute, click the "Edit" button next to it.
5. To delete a substitute, click the "Delete" button next to it.

## Troubleshooting

### Backend Issues

- If you see database connection errors, ensure MongoDB is running and accessible.
- Check that your `.env` file contains the correct MongoDB URI.
- Verify that port 3001 (or your configured port) is not in use by another application.

### Frontend Issues

- If the application cannot connect to the backend, ensure the backend server is running.
- Check browser console for JavaScript errors.
- Clear browser cache if you experience unexpected behavior after updates.

### File Operations Issues

- If file operations fail, check that the backend has appropriate permissions for the file system operations.
- Ensure file paths are valid and contain no invalid characters.

## Next Steps

Refer to the `architecture.md` document for a detailed overview of the application structure and API endpoints.
