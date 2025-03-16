const mysql = require('mysql2/promise');
const config = require('../config/config');

// 创建数据库连接池
const pool = mysql.createPool(config.mysql);

/**
 * 执行SQL查询，自动处理参数类型
 * @param {string} sql SQL查询语句
 * @param {Array} params 查询参数
 * @returns {Promise} 查询结果
 */
const execute = async (sql, params) => {
  if (!params) {
    return pool.execute(sql);
  }
  
  // 将所有数字类型转换为字符串，避免类型错误
  const newParams = params.map(item => {
    if (typeof item === 'number') {
      return item.toString();
    }
    return item;
  });
  
  const connection = await pool.getConnection();
  try {
    return await connection.execute(sql, newParams);
  } finally {
    connection.release();
  }
};

/**
 * 获取数据库连接
 * @returns {Promise<Connection>} 数据库连接
 */
const getConnection = async () => {
  return await pool.getConnection();
};

module.exports = {
  execute,
  getConnection,
  pool
};
