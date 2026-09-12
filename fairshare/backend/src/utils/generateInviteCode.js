const { v4: uuidv4 } = require('uuid');

/**
 * Generates a unique 8-character alphanumeric invite code.
 * e.g. "A3X9KP2M"
 */
const generateInviteCode = () => {
  return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
};

module.exports = { generateInviteCode };
