const app = getApp();

Page({
  data: {
    alarmRecords: [],
    loading: false
  },

  onLoad() {
    this.fetchAlarmRecords();
  },

  // 支持下拉刷新
  onPullDownRefresh() {
    this.fetchAlarmRecords();
  },

  fetchAlarmRecords() {
    this.setData({ loading: true });
    
    // 获取token
    const token = wx.getStorageSync('token');
    console.log('报警记录请求，token:', token);
    
    // 使用固定的baseUrl，避免undefined问题
    const baseUrl = 'http://localhost:3000';
    console.log('报警记录请求URL:', `${baseUrl}/api/alarm-records`);
    
    wx.request({
      url: `${baseUrl}/api/alarm-records`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token  // 修改为"Bearer "前缀的格式
      },
      success: (res) => {
        console.log('报警记录请求响应:', res.data);
        if (res.data.code === 200) {
          // 处理状态为中文
          const records = res.data.data.map(item => {
            // 添加中文状态
            switch(item.alarm_status) {
              case 'Processing':
                item.alarm_status_cn = '处理中';
                break;
              case 'Resolved':
                item.alarm_status_cn = '已解决';
                break;
              case 'Pending':
                item.alarm_status_cn = '待处理';
                break;
              default:
                item.alarm_status_cn = item.alarm_status;
            }
            return item;
          });
          
          this.setData({
            alarmRecords: records
          });
        } else if (res.data.code === 401) {
          console.log('Token无效或已过期，尝试重新登录');
          // 可以添加重新登录逻辑，类似于community_rating.js中的处理
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取报警记录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取报警记录失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      }
    });
  }
}); 