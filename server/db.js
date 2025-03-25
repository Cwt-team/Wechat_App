const mysql = require('mysql2/promise');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',  // 请根据实际情况修改
  database: 'wuye',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

// 执行SQL查询的通用函数
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL查询执行失败:', error);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection
};