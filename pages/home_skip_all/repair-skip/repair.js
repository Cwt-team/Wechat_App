Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    repairTypes: [
      { id: 'public_facility', name: '公共设施', icon: '/images/icons/public.png' },
      { id: 'personage', name: '个人住所', icon: '/images/icons/personage.png' },
      { id: 'history', name: '历史记录', icon: '/images/icons/history.png' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    if (userInfo && token) {
      this.setData({ 
        userInfo,
        hasUserInfo: true
      });
    }
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 检查登录状态
    this.checkLoginStatus();
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            });
          }
        }
      });
    }
  },

  // 跳转到公共区域报修
  navigateToPublic() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/home_skip_all/repair-skip/public/public',
    });
  },

  // 跳转到个人区域报修
  navigateToPersonage() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/home_skip_all/repair-skip/personage/personage',
    });
  },

  // 查看历史报修记录
  viewHistory() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/home_skip_all/repair-skip/repairhistory/repairhistory',
    });
  },
  
  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            });
          }
        }
      });
      return false;
    }
    return true;
  },
  
  // 处理点击服务项目
  handleServiceTap(e) {
    const type = e.currentTarget.dataset.type;
    
    switch(type) {
      case 'public_facility':
        this.navigateToPublic();
        break;
      case 'personage':
        this.navigateToPersonage();
        break;
      case 'history':
        this.viewHistory();
        break;
    }
  }
}) 