const bcrypt = require('bcrypt');

/**
 * 加密密码
 * @param {string} password - 原始密码
 * @returns {Promise<string>} - 加密后的密码
 */
async function hashPassword(password) {
    try {
        // 生成盐值，10是加密强度
        const salt = await bcrypt.genSalt(10);
        // 使用盐值加密密码
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('密码加密失败:', error);
        throw error;
    }
}

/**
 * 验证密码
 * @param {string} password - 原始密码
 * @param {string} hashedPassword - 加密后的密码
 * @returns {Promise<boolean>} - 验证结果
 */
async function verifyPassword(password, hashedPassword) {
    try {
        // 比较原始密码和加密后的密码
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        console.error('密码验证失败:', error);
        throw error;
    }
}

module.exports = {
    hashPassword,
    verifyPassword
}; 