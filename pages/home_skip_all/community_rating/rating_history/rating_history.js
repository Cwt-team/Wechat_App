const app = getApp();

Page({
  data: {
    ratingHistory: []
  },

  onLoad: function (options) {
    console.log('评价历史页面加载');
    const that = this;
    
    // 获取页面跳转时传递的数据
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('transferRatingHistory', function(data) {
      console.log('接收到评价历史数据:', data);
      that.setData({
        ratingHistory: data.ratingHistory || []
      });
    });
    
    // 如果没有接收到数据，直接从服务器获取
    if (!this.data.ratingHistory || this.data.ratingHistory.length === 0) {
      console.log('未接收到数据，直接从服务器获取');
      this.loadRatingHistory();
    }
  },

  // 从服务器加载评价历史
  loadRatingHistory: function() {
    console.log('从服务器加载评价历史');
    const that = this;
    
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/community/review/history',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success(res) {
        console.log('获取评价历史响应:', res.data);
        if (res.data.code === 200) {
          that.setData({
            ratingHistory: res.data.data || []
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取历史失败',
            icon: 'none'
          });
        }
      },
      fail(err) {
        console.error('请求评价历史失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 预览图片
  previewImage: function (e) {
    const current = e.currentTarget.dataset.current;
    const urls = e.currentTarget.dataset.urls;
    console.log('预览图片:', { current, urls });
    
    wx.previewImage({
      current: current,
      urls: urls
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
}) 