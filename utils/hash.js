const bcrypt = require('bcrypt')

module.exports.hashed = async (pass) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(pass, salt);

        return hash;  // Return the hash
    } catch (err) {
        throw new Error('Error hashing password: ' + err.message);
    }
};