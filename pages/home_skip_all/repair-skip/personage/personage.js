Page({
  data: {
    roomNumber: '',
    categories: ['电器', '水管', '家具', '其他'],
    selectedCategory: '请选择类别',
    description: '',
    images: [],
    contactName: '',
    phoneNumber: ''
  },
  onRoomInput: function (e) {
    this.setData({
      roomNumber: e.detail.value
    });
  },
  onCategoryChange: function (e) {
    this.setData({
      selectedCategory: this.data.categories[e.detail.value]
    });
  },
  onDescriptionInput: function (e) {
    this.setData({
      description: e.detail.value
    });
  },
  chooseImage: function () {
    let that = this;
    wx.chooseImage({
      count: 9, // 允许选择的最大图片数
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // 将新选择的图片添加到已有的图片数组中
        const newImages = that.data.images.concat(res.tempFilePaths);
        that.setData({
          images: newImages.slice(0, 9) // 确保最多只显示9张图片
        });
      }
    });
  },
  onContactInput: function (e) {
    this.setData({
      contactName: e.detail.value
    });
  },
  onPhoneInput: function (e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },
  submitRepairRequest: function () {
    const { roomNumber, selectedCategory, description, images, contactName, phoneNumber } = this.data;
    if (!roomNumber || selectedCategory === '请选择类别' || !description || !contactName || !phoneNumber) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    const repairRequest = {
      roomNumber,
      category: selectedCategory,
      description,
      images,
      contactName,
      phoneNumber
    };

    console.log('提交的报修信息:', repairRequest);
    wx.showToast({
      title: '报修提交成功',
      icon: 'success'
    });

    // 在这里可以调用后端接口提交数据
  }
});