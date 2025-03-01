Page({
  data: {
    userInfo: null,
    houseInfo: '',
    communityInfo: ''
  },
  
  onLoad: function() {
    // 获取存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        houseInfo: userInfo.house_full_name || '',
        communityInfo: userInfo.community_name || ''
      });
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }
  }
}); 