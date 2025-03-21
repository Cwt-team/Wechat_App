Page({
  data: {
    login: {
      show: false,
      avatar: '',
      username: '未登录',
      line: false
    },
    userInfo: null,
    houseInfo: '',
    communityInfo: '',
    unitInfo: '',
    roomInfo: ''
  },

  onLoad: function () {
    this.checkLoginStatus();
  },

  onShow: function () {
    // 每次页面显示时检查登录状态，确保数据最新
    this.checkLoginStatus();
  },

  checkLoginStatus: function () {
    // 获取存储的用户信息和token
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');

    if (userInfo && token) {
      // 已登录状态
      this.setData({
        login: {
          show: true,
          avatar: userInfo.avatar_url || '/images/default-avatar.png',
          username: userInfo.nickname || userInfo.name || '业主',
          line: true
        },
        userInfo: userInfo,
        houseInfo: userInfo.house_full_name || '',
        communityInfo: userInfo.community_name || '',
        unitInfo: userInfo.unit_number ? `${userInfo.unit_number}单元` : '',
        roomInfo: userInfo.room_number || ''
      });
    } else {
      // 未登录状态
      this.setData({
        login: {
          show: false,
          avatar: 'https://img0.baidu.com/it/u=3204281136,1911957924&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          username: '未登录',
          line: false
        },
        userInfo: null,
        houseInfo: '',
        communityInfo: '',
        unitInfo: '',
        roomInfo: ''
      });
    }
  },

  chooseAvatar: function (e) {
    // 如果用户未登录，跳转到登录页面
    if (!this.data.login.show) {
      wx.navigateTo({
        url: '/pages/logic/logic'
      });
      return;
    }

    // 已登录用户可以更换头像
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
        userInfo.avatar_url = tempFilePaths[0];
        wx.setStorageSync('userInfo', userInfo);

        // 这里可以添加上传头像到服务器的代码
      }
    });
  },

  switchUser: function () {
    // 跳转到登录页面重新登录
    wx.navigateTo({
      url: '/pages/logic/logic'
    });
  },

  exitClick: function () {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success(res) {
        if (res.confirm) {
          // 清除用户信息和token
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');

          // 更新页面数据
          that.setData({
            login: {
              show: false,
              avatar: 'https://img0.baidu.com/it/u=3204281136,1911957924&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
              username: '未登录',
              line: false
            },
            userInfo: null,
            houseInfo: '',
            communityInfo: '',
            unitInfo: '',
            roomInfo: ''
          });
        }
      }
    });
  },

  basicclick: function () {
    // 如果未登录，提示用户登录
    if (!this.data.login.show) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 跳转到基本信息页面
    wx.navigateTo({
      url: '/pages/user_info/user_info'
    });
  },

  settingClick: function () {
    // 跳转到设置页面
    wx.navigateTo({
      url: '/pages/user_setting/user_setting'
    });
  },

  feedbackClick: function () {
    // 如果未登录，提示用户登录
    if (!this.data.login.show) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 跳转到投诉页面
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  }
});