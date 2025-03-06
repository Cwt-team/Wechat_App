Page({
  data: {
    types: ['投诉', '建议'],
    selectedType: '请选择类型',
    address: '',
    content: '',
    images: [],
    maxImages: 3,
    suggestionHistory: [] // 用于存储投诉建议记录
  },

  onTypeChange: function (e) {
    this.setData({
      selectedType: this.data.types[e.detail.value]
    });
  },

  onAddressInput: function (e) {
    this.setData({
      address: e.detail.value
    });
  },

  onContentInput: function (e) {
    this.setData({
      content: e.detail.value
    });
  },

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

  submitSuggestion: function () {
    const { selectedType, address, content, images } = this.data;
    if (selectedType === '请选择类型' || !address || !content) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    // 获取当前日期
    const currentDate = new Date().toLocaleDateString();
    const suggestionData = {
      date: currentDate, // 记录生成投诉建议的日期
      type: selectedType,
      address,
      content,
      images
    };

    // 记录投诉建议
    this.setData({
      suggestionHistory: [...this.data.suggestionHistory, suggestionData]
    });

    wx.showToast({
      title: '提交成功',
      icon: 'success'
    });

    console.log('投诉建议记录:', this.data.suggestionHistory);
  },

  navigateToHistory: function () {
    wx.navigateTo({
      url: '/pages/home_skip_all/suggestion/suggestionhistory/suggestionhistory',
      success: (res) => {
        res.eventChannel.emit('transferSuggestionHistory', {
          suggestionHistory: this.data.suggestionHistory
        });
      }
    });
  }
});