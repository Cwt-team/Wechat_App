const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',  // 确保这里的地址正确
  ENDPOINTS: {
    // 其他端点...
    CALL_RECORDS: '/api/call-records'
  }
};

// 获取呼叫记录
export function getCallRecords() {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    console.log('开始请求呼叫记录');
    console.log('当前token:', token);
    console.log('请求URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CALL_RECORDS);
    
    if (!token) {
      console.error('未找到token');
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
        console.log('呼叫记录接口响应:', res);
        if (res.data.code === 200) {
          resolve(res.data.data);
        } else {
          console.error('获取呼叫记录失败:', res.data);
          reject(new Error(res.data.message || '获取呼叫记录失败'));
        }
      },
      fail: (err) => {
        console.error('请求呼叫记录接口失败:', err);
        reject(err);
      }
    });
  });
} 