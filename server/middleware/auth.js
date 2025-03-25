const jwt = require('jsonwebtoken');
const config = require('../config/config');
const mysql = require('mysql2/promise');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 认证中间件
const authMiddleware = (req, res, next) => {
  try {
    // 获取token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录'
      });
    }

    const token = authHeader.split(' ')[1];

    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret || 'your-secret-key');

    // 将用户信息添加到请求中
    req.user = {
      id: decoded.id,
      openid: decoded.openid,
      name: decoded.name,
      phone: decoded.phone,
      type: decoded.type || 'resident',
      house_id: decoded.house_id,
      community_id: decoded.community_id,
      house_full_name: decoded.house_full_name
    };

    // 如果token中没有用户ID但有openid，尝试通过openid查询
    if (!req.user.id && req.user.openid) {
      console.log('token中没有用户ID，尝试通过openid查询:', req.user.openid);

      const connection = await pool.getConnection();
      try {
        const [owners] = await connection.execute(
          'SELECT id FROM owner_info WHERE wx_openid = ?',
          [req.user.openid]
        );

        if (owners.length > 0) {
          console.log('通过openid找到用户:', owners[0]);
          req.user.id = owners[0].id;
        } else {
          console.log('未找到对应openid的用户');
        }
      } finally {
        connection.release();
      }
    }

    console.log('设置的用户信息:', req.user);

    next();
  } catch (error) {
    console.error('Token验证失败:', error);
    return res.status(401).json({
      code: 401,
      message: 'Token无效或已过期'
    });
  }
};

module.exports = authMiddleware; 