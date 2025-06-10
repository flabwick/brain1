// Utility functions for server

/**
 * Send JSON response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Data to send
 */
function sendJsonResponse(res, statusCode, data) {
    res.status(statusCode).json(data);
}

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
function sendErrorResponse(res, statusCode, message) {
    res.status(statusCode).json({ error: message });
}

/**
 * Parse request body
 * @param {object} req - Express request object
 * @returns {Promise<object>} - Parsed request body
 */
function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = '';
            
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                if (body) {
                    resolve(JSON.parse(body));
                } else {
                    resolve({});
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    sendJsonResponse,
    sendErrorResponse,
    parseRequestBody
};
