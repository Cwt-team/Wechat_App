Page({
  data: {
    login: {
      show: false,
      avatar: '',
      username: '未登录',
      line: false // 用于控制切换用户和退出登录按钮的显示
    },
    accountList: [
      { username: 'user1', avatar: 'https://example.com/avatar1.png' },
      { username: 'user2', avatar: 'https://example.com/avatar2.png' }
    ]
  },
  onLoad: function() {
    // 获取存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        login: {
          show: true,
          avatar: userInfo.avatar,
          username: userInfo.username,
          line: true
        }
      });
    }
  },
  chooseAvatar: function() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        that.setData({
          'login.avatar': tempFilePaths[0]
        });

        // 更新存储的用户信息
        const userInfo = wx.getStorageSync('userInfo');
        userInfo.avatar = tempFilePaths[0];
        wx.setStorageSync('userInfo', userInfo);
      }
    });
  },
  switchAccount: function() {
    // 模拟切换账号逻辑
    const nextAccount = this.data.accountList.find(account => account.username !== this.data.login.username);
    if (nextAccount) {
      wx.setStorageSync('userInfo', nextAccount);
      this.setData({
        login: {
          show: true,
          avatar: nextAccount.avatar,
          username: nextAccount.username,
          line: true
        }
      });
    }
  },
  exitClick: function() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success(res) {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');

          // 更新页面数据
          that.setData({
            login: {
              show: false,
              avatar: 'https://img0.baidu.com/it/u=3204281136,1911957924&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
              username: '未登录',
              line: false
            }
          });

          // 跳转到登录页面
          wx.redirectTo({
            url: '/pages/logic/logic'
          });
        }
      }
    });
  },
  settingClick: function() {
    // 跳转到 user_setting 页面
    wx.navigateTo({
      url: '/pages/user_setting/user_setting'
    });
  }
});