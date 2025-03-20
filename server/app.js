const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const config = require('./config/config');

const app = express();

// 设置开发环境
process.env.NODE_ENV = 'development';

// CORS 配置
const corsOptions = {
  origin: function(origin, callback) {
    // 允许本地开发环境和微信小程序请求
    const allowedOrigins = [
      'http://localhost:8080',
      'http://127.0.0.1:8080'
    ];
    
    // 微信小程序发起的请求 origin 为 undefined
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不允许的跨域请求'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

// 添加 body-parser 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS 配置
app.use(cors(corsOptions));

// Session 配置
app.use(session({
  secret: config.jwt.secret || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// 静态文件服务
app.use('/images', express.static('public/images'));

// 路由
app.use('/api/login', require('./routes/login'));
app.use('/api/call-records', require('./routes/callRecords'));
app.use('/api/owner', require('./routes/owner'));
const communityRoutes = require('./routes/community');
app.use('/api/community', communityRoutes);
app.use('/api/repair', require('./routes/repair'));
app.use('/api/notice', require('./routes/notice'));
app.use('/api/notices', require('./routes/notice'));

// 添加访客邀请路由
const visitorInvitationRouter = require('./routes/visitorInvitation');
app.use('/api/visitor-invitation', visitorInvitationRouter);

// 添加健康检查接口
app.get('/api/health', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 收到健康检查请求`);
  console.log('客户端信息:', {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    platform: req.headers['platform'] || '未知平台'
  });

  res.json({
    code: 200,
    message: '服务器连接正常',
    timestamp,
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage()
    }
  });
  
  console.log(`[${timestamp}] 健康检查响应成功`);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app; 