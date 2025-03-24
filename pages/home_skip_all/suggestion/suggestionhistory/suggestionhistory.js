const app = getApp();

Page({
  data: {
    suggestions: [],
    loading: true
  },

  onLoad: function() {
    this.loadSuggestionHistory();
  },

  loadSuggestionHistory: function() {
    console.log('开始加载投诉建议历史');
    wx.showLoading({
      title: '加载中...'
    });

    wx.request({
      url: app.globalData.apiBaseUrl + '/api/suggestion/history',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        console.log('获取历史记录响应:', res.data);
        if (res.data.code === 200) {
          this.setData({
            suggestions: res.data.data.list,
            loading: false
          });
        } else {
          wx.showToast({
            title: res.data.message || '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取历史记录失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ loading: false });
      }
    });
  }
});