const jwt = require('jsonwebtoken');
const config = require('../config/config');
const mysql = require('mysql2/promise');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    // 获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.json({
        code: 401,
        message: '未授权，请先登录'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret || 'your-secret-key');
    console.log('认证中间件解析token结果:', decoded);
    
    // 如果token中没有用户ID但有openid，尝试通过openid查询用户ID
    if (!decoded.id && decoded.openid) {
      console.log('token中没有用户ID，尝试通过openid查询:', decoded.openid);
      
      const connection = await pool.getConnection();
      try {
        const [owners] = await connection.execute(
          'SELECT id FROM owner_info WHERE wx_openid = ?',
          [decoded.openid]
        );
        
        if (owners.length > 0) {
          console.log('通过openid找到用户:', owners[0]);
          decoded.id = owners[0].id;
        } else {
          console.log('未找到对应openid的用户');
        }
      } finally {
        connection.release();
      }
    }
    
    // 设置用户信息
    req.user = {
      id: decoded.id,
      type: decoded.type
    };
    
    console.log('设置的用户信息:', req.user);
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.json({
      code: 401,
      message: '认证失败，请重新登录'
    });
  }
};

module.exports = authMiddleware; 