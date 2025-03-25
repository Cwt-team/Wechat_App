// app.js
App({
  globalData: {
    baseUrl: 'http://localhost:3000', // 替换为您的实际API服务器地址
    userInfo: null,
    token: null,
    isLogin: false
  },

  onLaunch: function () {
    // 启动时初始化baseUrl
    // 可以根据环境判断使用不同的baseUrl
    const env = wx.getAccountInfoSync().miniProgram.envVersion;
    if (env === 'develop') {
      // 开发环境
      this.globalData.baseUrl = 'http://localhost:3000';
    } else if (env === 'trial') {
      // 体验版环境
      this.globalData.baseUrl = 'https://test-api.yourserver.com';
    } else {
      // 正式环境
      this.globalData.baseUrl = 'https://api.yourserver.com';
    }

    console.log('当前运行环境:', env);
    console.log('使用的API地址:', this.globalData.baseUrl);

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

  checkLoginStatus: function () {
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

  clearLoginInfo: function () {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },

  // 登录方法
  login: function (callback) {
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
  checkLogin: function (callback) {
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
  },

  // 在全局 getUserInfo 函数中添加获取房屋信息的逻辑
  getUserInfo: function () {
    const token = wx.getStorageSync('token');

    if (!token) {
      console.log('未登录，无法获取用户信息');
      return;
    }

    wx.request({
      url: `${this.globalData.baseUrl}/api/login/check`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 200) {
          const userInfo = res.data.data.userInfo;
          this.globalData.userInfo = userInfo;

          console.log('登录成功，获取到用户信息:', userInfo);

          // 登录成功后立即获取用户房屋信息
          this.getUserHouses();

          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(res.data.data);
          }
        }
      }
    });
  },

  // 获取用户的房屋列表
  getUserHouses: function () {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${this.globalData.baseUrl}/api/maintenance/user-houses`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.length > 0) {
          console.log('获取到用户房屋列表:', res.data);

          // 保存房屋列表
          this.globalData.houses = res.data;

          // 设置默认选中的房屋
          const defaultHouse = res.data[0];
          const selectedHouse = {
            id: defaultHouse.houseId,
            community_id: defaultHouse.communityId,
            house_full_name: defaultHouse.house_full_name,
            community_name: defaultHouse.community_name
          };

          wx.setStorageSync('selectedHouse', selectedHouse);

          // 更新全局用户信息中的房屋信息
          this.globalData.userInfo = {
            ...this.globalData.userInfo,
            house_id: defaultHouse.houseId,
            community_id: defaultHouse.communityId,
            house_full_name: defaultHouse.house_full_name,
            community_name: defaultHouse.community_name
          };

          console.log('已设置默认房屋:', selectedHouse);
        }
      },
      fail: (err) => {
        console.error('获取用户房屋失败:', err);
      }
    });
  }
})
