// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    isLogin: false
  },
  
  onLaunch: function() {
    // 检查登录状态
    this.checkLoginStatus();

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)


    wx.request({
      url: 'http://localhost:3000/api/health',
      method: 'GET',
      success(res) {
        console.log('后端连接测试成功:', res.data);
        wx.showToast({
          title: '连接成功',
          icon: 'success'
        });
      },
      fail(err) {
        console.error('后端连接测试失败:', err);
        wx.showToast({
          title: '连接失败',
          icon: 'error'
        });
      }
    });
  },
  
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      
      // 验证token是否有效
      wx.request({
        url: 'http://localhost:3000/api/login/check',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + token
        },
        success: (res) => {
          if (res.data.code !== 200) {
            // token无效，清除登录信息
            this.clearLoginInfo();
          } else {
            // 更新用户信息
            wx.setStorageSync('userInfo', res.data.data.userInfo);
            this.globalData.userInfo = res.data.data.userInfo;
          }
        },
        fail: () => {
          // 请求失败，可能是网络问题，暂时保留登录状态
          console.error('验证token失败，可能是网络问题');
        }
      });
    } else {
      // 未登录状态
      this.clearLoginInfo();
    }
  },
  
  clearLoginInfo: function() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },
  
  // 登录方法
  login: function(callback) {
    console.log('开始登录流程');
    wx.login({
      success: res => {
        console.log('获取登录凭证成功:', res.code);
        // 获取用户信息
        wx.getUserProfile({
          desc: '用于完善会员资料',
          success: userRes => {
            console.log('获取用户信息成功:', userRes.userInfo);
            
            // 调用后端登录接口
            wx.request({
              url: 'http://localhost:3000/api/login/wechat',
              method: 'POST',
              data: {
                code: res.code,
                userInfo: userRes.userInfo
              },
              success: loginRes => {
                console.log('登录接口返回:', loginRes.data);
                
                if (loginRes.data.code === 200) {
                  // 登录成功
                  this.globalData.token = loginRes.data.data.token;
                  this.globalData.userInfo = loginRes.data.data.userInfo;
                  this.globalData.isLogin = true;
                  
                  wx.setStorageSync('token', loginRes.data.data.token);
                  wx.setStorageSync('userInfo', loginRes.data.data.userInfo);
                  
                  if (callback) callback(true);
                } else if (loginRes.data.code === 201) {
                  // 需要绑定账号
                  wx.navigateTo({
                    url: '/pages/bind-account/bind-account?openid=' + loginRes.data.data.openid
                  });
                  
                  if (callback) callback(false);
                } else {
                  // 登录失败
                  wx.showToast({
                    title: loginRes.data.message || '登录失败',
                    icon: 'none'
                  });
                  
                  if (callback) callback(false);
                }
              },
              fail: err => {
                console.error('登录请求失败:', err);
                wx.showToast({
                  title: '网络错误，请稍后重试',
                  icon: 'none'
                });
                
                if (callback) callback(false);
              }
            });
          },
          fail: err => {
            console.error('获取用户信息失败:', err);
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            });
            
            if (callback) callback(false);
          }
        });
      },
      fail: err => {
        console.error('获取登录凭证失败:', err);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
        
        if (callback) callback(false);
      }
    });
  },
  
  // 检查是否登录
  checkLogin: function(callback) {
    if (this.globalData.isLogin) {
      callback({ is_login: true });
      return;
    }
    
    const token = wx.getStorageSync('token');
    if (!token) {
      callback({ is_login: false });
      return;
    }
    
    wx.request({
      url: 'http://localhost:3000/api/login/check',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: res => {
        callback({
          is_login: res.data.code === 200
        });
      },
      fail: () => {
        callback({ is_login: false });
      }
    });
  }
})
