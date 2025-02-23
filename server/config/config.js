require('dotenv').config();

const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // MySQL配置
  mysql: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: process.env.DB_CHARSET
  },
  
  // 微信小程序配置
  weapp: {
    appId: process.env.WEAPP_APPID || '你的小程序appId',
    appSecret: process.env.WEAPP_APPSECRET || '你的小程序appSecret'
  },
  
  // 短信服务配置(以阿里云为例)
  sms: {
    accessKeyId: 'your_access_key_id',
    accessKeySecret: 'your_access_key_secret',
    signName: '您的短信签名',
    templateCode: 'SMS_XXXXX' // 短信模板ID
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};

module.exports = config; 