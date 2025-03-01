const API_CONFIG = {
  BASE_URL: 'https://your-api-server.com',
  ENDPOINTS: {
    // 其他端点...
    CALL_RECORDS: '/api/call-records'
  }
};

// 获取呼叫记录
export function getCallRecords() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    if (!token) {
      reject(new Error('未登录'));
      return;
    }
    
    wx.request({
      url: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CALL_RECORDS,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '获取呼叫记录失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
} 