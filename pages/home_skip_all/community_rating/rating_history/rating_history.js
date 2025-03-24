const app = getApp();

Page({
  data: {
    ratingHistory: []
  },

  onLoad: function() {
    this.loadRatingHistory();
  },

  // 从服务器加载评价历史
  loadRatingHistory: function() {
    const that = this;
    wx.showLoading({
      title: '加载中...'
    });
    
    wx.request({
      url: getApp().globalData.apiBaseUrl + '/api/community/review/history',
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
      },
      complete() {
        wx.hideLoading();
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