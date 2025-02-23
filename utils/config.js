const API_CONFIG = {
  BASE_URL: 'http://localhost:3000', // 修改为您的实际后端地址
  // BASE_URL: 'https://your-domain.com', // 生产环境
  ENDPOINTS: {
    LOGIN: {
      WECHAT: '/api/login/wechat',
      PHONE: '/api/login/phone',
      VERIFY_CODE: '/api/login/verify-code',
      BIND_PHONE: '/api/login/bind-phone'
    },
    USER: {
      INFO: '/api/user/info',
      UPDATE: '/api/user/update'
    }
  }
};

module.exports = API_CONFIG; 