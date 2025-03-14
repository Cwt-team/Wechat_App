// pages/home_skip_all/community_rating/community_rating.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stars: [0, 1, 2, 3, 4],
    currentRating: 0,
    content: '',
    images: [],
    maxImages: 3,
    ratingHistory: []
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

  // 选择星级
  selectStar: function (e) {
    const rating = parseInt(e.currentTarget.dataset.star) + 1;
    this.setData({
      currentRating: rating
    });
  },

  // 输入评价内容
  onContentInput: function (e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 选择图片（可选）
  chooseImage: function () {
    const that = this;
    wx.chooseImage({
      count: this.data.maxImages - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const newImages = that.data.images.concat(res.tempFilePaths);
        that.setData({
          images: newImages.slice(0, that.data.maxImages)
        });
      }
    });
  },

  // 删除已选择的图片
  deleteImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({
      images: images
    });
  },

  // 提交评价
  submitRating: function () {
    if (this.data.currentRating === 0) {
      wx.showToast({
        title: '请选择星级评分',
        icon: 'none'
      });
      return;
    }

    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      });
      return;
    }

    const ratingData = {
      rating: this.data.currentRating,
      content: this.data.content,
      images: this.data.images,
      date: new Date().toLocaleString()
    };

    // 保存评价记录
    this.setData({
      ratingHistory: [...this.data.ratingHistory, ratingData],
      currentRating: 0,
      content: '',
      images: []
    });

    wx.showToast({
      title: '评价提交成功',
      icon: 'success'
    });

    console.log('评价记录:', ratingData);
  },

  // 查看历史评价
  viewHistory: function () {
    wx.navigateTo({
      url: './rating_history/rating_history',
      success: (res) => {
        res.eventChannel.emit('transferRatingHistory', {
          ratingHistory: this.data.ratingHistory
        });
      }
    });
  }
})