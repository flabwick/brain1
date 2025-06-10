// Middleware for parsing JSON body
function jsonBodyParser(req, res, next) {
    if (req.method === 'GET' || req.method === 'DELETE') {
        return next();
    }
    
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        if (body) {
            try {
                req.body = JSON.parse(body);
            } catch (error) {
                return res.status(400).json({ error: 'Invalid JSON' });
            }
        } else {
            req.body = {};
        }
        next();
    });
}

// Middleware for CORS
function cors(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
}

// Error handling middleware
function errorHandler(err, req, res, next) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
    jsonBodyParser,
    cors,
    errorHandler
};
