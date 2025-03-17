// pages/home_skip_all/repair-skip/processFlow/repairhistory/repairhistory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    repairHistory: []
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
    // 每次显示页面时获取最新的报修历史
    this.loadRepairHistory();
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
    this.loadRepairHistory();
    wx.stopPullDownRefresh();
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

  loadRepairHistory() {
    const history = wx.getStorageSync('repairHistory') || [];
    this.setData({
      repairHistory: history
    });
  },

  // 查看报修单详情
  viewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const order = this.data.repairHistory[index];

    wx.navigateTo({
      url: '../processFlow',
      success: function (res) {
        res.eventChannel.emit('acceptDataFromOpenerPage', order);
      }
    });
  },

  // 显示删除确认对话框
  showDeleteConfirm(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '是否要删除该报修单？',
      success: (res) => {
        if (res.confirm) {
          this.deleteRepairOrder(index);
        }
      }
    });
  },

  // 删除报修单
  deleteRepairOrder(index) {
    let repairHistory = wx.getStorageSync('repairHistory') || [];
    repairHistory.splice(index, 1);
    wx.setStorageSync('repairHistory', repairHistory);
    this.setData({
      repairHistory: repairHistory
    });
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  }
})