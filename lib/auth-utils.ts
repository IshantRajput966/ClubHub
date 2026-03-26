// secure authentication utilities

/**
 * Hashes a password using a secure algorithm.
 * @param {string} password - The password to be hashed.
 * @returns {string} - The hashed password.
 */
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512');
    return `${salt}:${hash.toString('hex')}`;
}

/**
 * Verifies a given password against a stored hash.
 * @param {string} password - The password to verify.
 * @param {string} hashed - The stored hashed password.
 * @returns {boolean} - True if the password matches, otherwise false.
 */
function verifyPassword(password, hashed) {
    const [salt, hash] = hashed.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512');
    return verifyHash.toString('hex') === hash;
}

/**
 * Generates a secure token for authentication.
 * @returns {string} - A secure token.
 */
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = { hashPassword, verifyPassword, generateToken };