# Refactored Web Application Documentation

## Overview

This document describes the refactored architecture of the web application, which has been restructured to follow a more modular approach with clear separation of concerns.

## Architecture

### Backend

The backend follows an MVC (Model-View-Controller) architecture:

1. **Models**: Data structures and database operations
   - `FileModel`: Manages file/folder operations
   - `PromptModel`: Manages prompt operations
   - `SubstituteModel`: Manages substitute operations

2. **Controllers**: Business logic and request handling
   - `FileController`: Handles file-related requests
   - `PromptController`: Handles prompt-related requests
   - `SubstituteController`: Handles substitute-related requests

3. **Routes**: API endpoint definitions
   - `/api/files`: File operations
   - `/api/prompts`: Prompt operations
   - `/api/substitutes`: Substitute operations

4. **Configuration**: External settings
   - `db.js`: Database connection configuration
   - `server.js`: Server configuration settings

5. **Middleware**: Request/response processing
   - CORS handling
   - Error handling
   - Body parsing

### Frontend

The frontend follows a component-based architecture:

1. **Components**: UI modules
   - `fileTree.js`: Displays and manages the file tree
   - `fileContent.js`: Displays and edits file content
   - `fileCreation.js`: Creates new files/folders
   - `prompts.js`: Manages prompts
   - `substitutes.js`: Manages substitutes

2. **Services**: External communication
   - `api.js`: Communicates with the backend API

3. **Utils**: Helper functions
   - `uiUtils.js`: UI utility functions
   - `error.js`: Error handling functions

## API Endpoints

### Files API

- `GET /api/files`: Get file tree
- `GET /api/files/file?path={path}`: Get file by path
- `POST /api/files`: Create new file or folder
- `PUT /api/files/file?path={path}`: Update file content
- `DELETE /api/files/file?path={path}`: Delete file or folder

### Prompts API

- `GET /api/prompts`: Get all prompts
- `GET /api/prompts/{id}`: Get prompt by ID
- `POST /api/prompts`: Create new prompt
- `PUT /api/prompts/{id}`: Update prompt
- `DELETE /api/prompts/{id}`: Delete prompt

### Substitutes API

- `GET /api/substitutes`: Get all substitutes
- `GET /api/substitutes/{id}`: Get substitute by ID
- `POST /api/substitutes`: Create new substitute
- `PUT /api/substitutes/{id}`: Update substitute
- `DELETE /api/substitutes/{id}`: Delete substitute

## Database Structure

### Files Collection

```javascript
{
  _id: ObjectId,        // MongoDB automatically generated ID
  name: String,         // Name of the file or folder
  type: String,         // 'folder', 'txt', 'md', 'pdf', 'epub'
  path: String,         // Full path to the file or folder, unique identifier
  parentPath: String,   // Path of parent folder, empty for root items
  content: String,      // Text content for txt/md files, binary data reference for pdf/epub
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

### Prompts Collection

```javascript
{
  _id: ObjectId,        // MongoDB automatically generated ID
  title: String,        // Prompt title
  text: String,         // Prompt text content
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

### Substitutes Collection

```javascript
{
  _id: ObjectId,        // MongoDB automatically generated ID
  name: String,         // Substitute name
  filePath: String,     // Path to the file
  createdAt: Date,      // Creation timestamp
  updatedAt: Date       // Last update timestamp
}
```

## Running the Application

1. Start the backend:
   ```
   cd backend
   node server.js
   ```

2. Access the frontend:
   Open `frontend/index.html` in a browser or serve it with your preferred web server.

## Development Notes

- The frontend uses modern ES6 modules
- The backend uses Express.js
- MongoDB is used for data storage
- All API routes use consistent error handling
- File paths in API requests use query parameters instead of URL segments
