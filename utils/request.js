const API_CONFIG = require('./config');

const request = {
  async send(options) {
    const token = wx.getStorageSync('token');
    
    const defaultOptions = {
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      enableHttp2: true,
      enableQuic: true,
      enableCache: true
    };

    return new Promise((resolve, reject) => {
      wx.request({
        ...defaultOptions,
        ...options,
        url: options.url.startsWith('http') ? options.url : API_CONFIG.BASE_URL + options.url,
        success: (res) => {
          console.log('请求响应:', {
            url: options.url,
            statusCode: res.statusCode,
            data: res.data
          });

          if (!res.data) {
            reject(new Error('服务器未返回数据'));
            return;
          }

          // 处理token过期
          if (res.data.code === 401 && token) {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.redirectTo({
              url: '/pages/logic/logic'
            });
            reject(new Error('登录已过期'));
            return;
          }

          resolve(res);
        },
        fail: (err) => {
          console.error('请求失败:', err);
          reject(new Error(err.errMsg || '请求失败'));
        }
      });
    });
  }
};

module.exports = request; 