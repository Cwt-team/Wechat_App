// pages/repair-skip/repair-skip.js
Page({
onClickLeft() {
    wx.showToast({ title: '点击返回', icon: 'https://b.yzcdn.cn/vant/icon-demo-1126.png' });
  },
  onClickRight() {
    wx.showToast({ title: '点击按钮', icon: 'none' });
  },
  onPersonageClick() {
    wx.navigateTo({
      url: '/pages/home_skip_all/repair-skip/personage/personage',
    });
  },
  onPublicClick() {
    wx.navigateTo({
      url: '/pages/home_skip_all/repair-skip/public/public',
    });
  },
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

  }
})