// pages/contact/contact.js
Page({
  data: {
    login: {
      avatar: 'https://img0.baidu.com/it/u=3204281136,1911957924&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',//用户头像
      username: '未登录', // 用户名
    }
  },
  //登录监听
  chooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl; // 获取用户选择的头像URL
    const username = '用户的用户名'; // 假设你从某个地方获取用户名（例如从服务器或用户输入）

    this.setData({
      login: {
        show: true,
        line:true,
        avatar: e.detail.avatarUrl,
        username:username,
      }
    })
     // 存储头像信息到本地
     wx.setStorageSync('userInfo', {
      avatar: avatarUrl,
      username:username,  // 用户名保持不变
    });
  },
  //基本信息
  basicClick() {
    console.log('基本信息监听');
  },
   
   // 匿名反馈
   feedbackClick() {
    console.log('匿名反馈监听');
  },
  // 关于我们
  aboutClick() {
    console.log('关于我们监听');
  },

  // 切换用户功能
switchUser() {
  wx.showModal({
    title: '提示',
    content: '确定切换用户吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除当前用户信息
        wx.removeStorageSync('userInfo');

        // 清空当前页面中的用户数据
        this.setData({
          login: {
            show: false,
            line: false,
            avatar: '默认头像URL',
            username: '未登录',
          },
        });

        // 跳转到登录页面或触发头像选择
        wx.navigateTo({
          url: '/pages/login/login', // 登录页路径
        });
      }
    },
  });
},

  // 退出监听
  exitClick() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success(res) {
        if (res.confirm) {
          that.setData({
            login: {
              show: false,
              avatar: 'https://img0.baidu.com/it/u=3204281136,1911957924&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
            }
          })
        }
      }
    })
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        login: {
          show: true,
          line: true,
          avatar: userInfo.avatar,
          username: userInfo.username,
        },
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkUserInfo();
  },
// 检查并更新用户信息
checkUserInfo() {
  const userInfo = wx.getStorageSync('userInfo');  // 从本地存储获取用户信息

  if (userInfo) {
    // 如果有用户信息，更新页面数据
    this.setData({
      login: {
        show: true,
        line: true,   // 登录后显示“退出登录”按钮
        avatar: userInfo.avatar,
        username: userInfo.username,
      },
    });
  } else {
    // 如果没有用户信息，显示默认状态
    this.setData({
      login: {
        show: false,
        line: false,  // 未登录时不显示“退出登录”按钮
        avatar: '默认头像URL',  // 设置默认头像
        username: '未登录',  // 设置默认用户名
      },
    });
  }
},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})