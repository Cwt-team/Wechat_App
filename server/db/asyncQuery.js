const pool = require('./index');

/**
 * 执行SQL查询的异步函数
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 查询参数
 * @returns {Promise} - 返回查询结果的Promise
 */
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = {
    query
}; 