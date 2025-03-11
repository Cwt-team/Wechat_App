// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

  },

  // 登录成功后的处理
  handleLoginSuccess(res) {
    console.log('登录成功，返回数据:', res.data);
    
    // 存储token和用户信息
    wx.setStorageSync('token', res.data.data.token);
    wx.setStorageSync('userInfo', res.data.data.userInfo);
    
    console.log('存储的token:', res.data.data.token);
    console.log('存储的用户信息:', res.data.data.userInfo);
    
    // 返回上一页或首页
    wx.navigateBack({
      delta: 1,
      fail: function() {
        wx.switchTab({
          url: '/pages/home/home'
        });
      }
    });
  }
})