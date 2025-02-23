const errorHandler = (err, req, res, next) => {
  console.error('全局错误处理:', err);

  // 处理跨域预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 处理常见错误类型
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }

  // 默认错误响应
  res.status(err.status || 500).json({
    code: err.code || 500,
    message: err.message || '服务器内部错误'
  });
};

module.exports = errorHandler; 