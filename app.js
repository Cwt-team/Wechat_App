// app.js
App({
  onLaunch() {
    // 检查登录状态
    this.checkLogin(res => {
      console.log('登录状态检查:', res);
      if (!res.is_login) {
        this.login();
      }
    });

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

  // 登录方法
  login() {
    console.log('开始登录流程');
    wx.login({
      success: res => {
        console.log('获取登录凭证成功:', res.code);
        // 获取用户信息
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: userRes => {
            // 发送 code 和 userInfo 到后端
            wx.request({
              url: 'http://localhost:3000/api/login/wechat',
              method: 'POST',
              data: {
                code: res.code,
                userInfo: userRes.userInfo
              },
              success: loginRes => {
                console.log('登录响应:', loginRes.data);
                if (loginRes.data.code === 200) {
                  // 保存登录信息
                  wx.setStorageSync('token', loginRes.data.data.token);
                  wx.setStorageSync('userInfo', loginRes.data.data.userInfo);
                  this.globalData.userInfo = loginRes.data.data.userInfo;
                  
                  // 跳转到主页
                  wx.switchTab({
                    url: '/pages/index/index',
                    success: () => {
                      console.log('跳转到主页成功');
                      wx.showToast({
                        title: '登录成功',
                        icon: 'success',
                        duration: 2000
                      });
                    },
                    fail: (err) => {
                      console.error('跳转到主页失败:', err);
                    }
                  });
                } else {
                // if (loginRes.data.code === 401) {
                //   // 需要绑定手机号
                //   wx.setStorageSync('wxLoginInfo', {
                //     openid: loginRes.data.data.openid,
                //     userInfo: userRes.userInfo
                //   });
                //   wx.navigateTo({ url: '/pages/bind-phone/bind-phone' });
                // } else
                 
                  console.error('登录失败:', loginRes.data.message);
                  wx.showToast({
                    title: loginRes.data.message || '登录失败',
                    icon: 'none'
                  });
                }
              },
              fail: err => {
                console.error('登录请求失败:', err);
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                });
              }
            });
          },
          fail: err => {
            console.error('获取用户信息失败:', err);
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            });
          }
        });
      },
      fail: err => {
        console.error('获取登录凭证失败:', err);
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    });
  },

  // 检查登录状态
  checkLogin(callback) {
    const token = wx.getStorageSync('token');
    if (!token) {
      callback({ is_login: false });
      return;
    }

    // 验证 token 有效性
    wx.request({
      url: 'http://localhost:3000/api/login/check',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
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
  },

  globalData: {
    userInfo: null
  }
})
