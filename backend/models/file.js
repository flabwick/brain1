// File schema structure for MongoDB
// This is just for reference - the actual schema is enforced in the application code

/*
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
*/

// Since we're using vanilla JS without frameworks, this file serves as documentation.
// The actual schema is implemented in server.js
