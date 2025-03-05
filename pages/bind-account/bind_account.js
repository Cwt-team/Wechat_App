Page({
  data: {
    openid: '',
    account: '',
    password: ''
  },
  
  onLoad: function(options) {
    if (options.openid) {
      this.setData({
        openid: options.openid
      });
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }
  },
  
  // 输入账号
  inputAccount: function(e) {
    this.setData({
      account: e.detail.value
    });
  },
  
  // 输入密码
  inputPassword: function(e) {
    this.setData({
      password: e.detail.value
    });
  },
  
  // 绑定已有账号
  bindAccount: function() {
    const { openid, account, password } = this.data;
    
    if (!account || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '绑定中...',
    });
    
    wx.request({
      url: 'http://localhost:3000/api/login/bind-account',
      method: 'POST',
      data: {
        openid: openid,
        account: account,
        password: password,
        isNew: false
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.data.code === 200) {
          // 绑定成功
          wx.setStorageSync('userInfo', res.data.data.userInfo);
          wx.setStorageSync('token', res.data.data.token);
          
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/home/home'
                });
              }, 1500);
            }
          });
        } else {
          // 绑定失败
          wx.showToast({
            title: res.data.message || '绑定失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        console.error('绑定请求失败:', err);
      }
    });
  },
  
  // 创建新账号
  createAccount: function() {
    const { openid, account, password } = this.data;
    
    if (!account || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '创建中...',
    });
    
    wx.request({
      url: 'http://localhost:3000/api/login/bind-account',
      method: 'POST',
      data: {
        openid: openid,
        account: account,
        password: password,
        isNew: true
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.data.code === 200) {
          // 创建成功
          wx.setStorageSync('userInfo', res.data.data.userInfo);
          wx.setStorageSync('token', res.data.data.token);
          
          wx.showToast({
            title: '创建成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/home/home'
                });
              }, 1500);
            }
          });
        } else {
          // 创建失败
          wx.showToast({
            title: res.data.message || '创建失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        console.error('创建请求失败:', err);
      }
    });
  }
});
