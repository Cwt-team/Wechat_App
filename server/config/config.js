require('dotenv').config();

const config = {
  // 服务器配置
  server: {
    port: 3000,
    host: 'localhost'
  },
  
  // MySQL配置
  mysql: {
    host: 'localhost',
    port: 3326,
    user: 'root',
    password: '123456',
    database: 'wuye',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  
  // 微信小程序配置
  weapp: {
    appId: 'wx020f80df8ae74383',
    appSecret: 'f101db91d9f7ecb73478f24d31cff78c'
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
    secret: 'your-jwt-secret',
    expiresIn: '7d'
  }
};

module.exports = config; 