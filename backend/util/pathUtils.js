function normalizePath(p) {
    if (!p) return '';
    // remove leading and trailing slashes
    p = p.replace(/^\/+/, '').replace(/\/+$/, '');
    return p;
}

function normalizeParentPath(p) {
    const normalized = normalizePath(p || '');
    return normalized;
}

module.exports = {
    normalizePath,
    normalizeParentPath
};
