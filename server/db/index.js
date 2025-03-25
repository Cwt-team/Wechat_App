const mysql = require('mysql');
const config = require('../config');

// 创建数据库连接池
const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    connectionLimit: 10
});

// 测试连接
pool.getConnection((err, connection) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功!');
    connection.release();
});

module.exports = pool; 