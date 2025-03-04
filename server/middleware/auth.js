const jwt = require('jsonwebtoken');
const config = require('../config/config');

// 认证中间件
const authMiddleware = (req, res, next) => {
  // 从请求头获取 token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.json({
      code: 401,
      message: '未提供认证令牌'
    });
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 将用户信息添加到请求对象
    req.user = {
      id: decoded.id,
      type: decoded.type
    };
    
    next();
  } catch (error) {
    console.error('Token验证失败:', error);
    return res.json({
      code: 401,
      message: '无效的认证令牌'
    });
  }
};

module.exports = authMiddleware; 