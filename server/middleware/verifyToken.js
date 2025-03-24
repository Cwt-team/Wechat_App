const jwt = require('jsonwebtoken');
const config = require('../config/config');
const mysql = require('mysql2/promise');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 验证token中间件
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.json({ code: 401, message: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.id;
    req.openid = decoded.openid;
    
    // 如果没有userId但有openid，尝试通过openid查询userId
    if (!req.userId && req.openid) {
      const connection = await pool.getConnection();
      try {
        const [owners] = await connection.execute(
          'SELECT id FROM owner_info WHERE wx_openid = ?',
          [req.openid]
        );
        
        if (owners.length > 0) {
          req.userId = owners[0].id;
        }
      } finally {
        connection.release();
      }
    }
    
    if (!req.userId) {
      return res.json({ code: 401, message: '无效的用户信息' });
    }
    
    next();
  } catch (error) {
    return res.json({ code: 401, message: 'token无效' });
  }
};

module.exports = verifyToken; 