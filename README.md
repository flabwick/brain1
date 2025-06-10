# File Manager App

A simple file manager web application that allows users to browse, view, create, and delete files and folders. 

## Features

- File tree navigation in a sidebar
- Support for folders and multiple file types (.txt, .md, .pdf, .epub)
- Create new files and folders
- Delete files and folders
- View file contents based on file type
- Persistent storage using MongoDB

## Getting Started

### Prerequisites

- Node.js
- MongoDB Atlas account (connection string required in `.env` file)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure your `.env` file is set up with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   FRONTEND_PORT=3000
   BACKEND_PORT=3001
   ```

3. Start the server:
   ```
   npm start
   ```

### Development

For development with auto-restart on code changes:
```
npm run dev
```

## File Types Supported

- Plain Text (.txt)
- Markdown (.md) - with basic rendering
- PDF (.pdf) - viewed in an iframe
- EPUB (.epub) - viewed in an iframe

## Project Structure

- `/frontend`: Contains all client-side code (HTML, CSS, JavaScript)
- `/backend`: Contains the server-side code
  - `/models`: Data models (reference only)
  - `/server.js`: Main server file

## Implementation Notes

- The app uses vanilla JavaScript without frontend frameworks
- The backend uses Node.js with a minimal set of dependencies
- MongoDB Atlas is used for data storage
- Files are stored directly in the database (not as filesystem files)
