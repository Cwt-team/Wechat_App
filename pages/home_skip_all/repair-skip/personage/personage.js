Page({
  data: {
    roomNumber: '',
    categories: ['电器', '水管', '家具', '其他'],
    selectedCategory: '请选择类别',
    description: '',
    images: [],
    contactName: '',
    phoneNumber: '',
    building: ''
  },
  onLoad: function () {
    this.getUserHouseInfo();
  },
  getUserHouseInfo: function () {
    const app = getApp();
    const userInfo = app.globalData.userInfo;

    console.log('当前用户信息:', userInfo);

    if (userInfo && userInfo.house_full_name) {
      const houseParts = userInfo.house_full_name.split('-');

      if (houseParts.length >= 2) {
        this.setData({
          building: houseParts[0],
          roomNumber: houseParts[1],
          contactName: userInfo.name || '',
          phoneNumber: userInfo.phone || ''
        });
        console.log('已自动填充房屋信息:', houseParts[0], houseParts[1]);
      }
    } else {
      const selectedHouse = wx.getStorageSync('selectedHouse');
      if (selectedHouse && selectedHouse.house_full_name) {
        const houseParts = selectedHouse.house_full_name.split('-');
        if (houseParts.length >= 2) {
          this.setData({
            building: houseParts[0],
            roomNumber: houseParts[1]
          });
          console.log('从storage获取到房屋信息');
        }
      } else {
        console.log('未找到用户房屋信息，请手动填写');
      }
    }
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
  onBuildingInput: function (e) {
    this.setData({
      building: e.detail.value
    });
  },
  validateForm: function () {
    const { building, roomNumber, selectedCategory, description, images, contactName, phoneNumber } = this.data;

    if (!building) {
      wx.showToast({
        title: '请填写楼栋信息',
        icon: 'none'
      });
      return false;
    }

    if (!roomNumber) {
      wx.showToast({
        title: '请填写房间号',
        icon: 'none'
      });
      return false;
    }

    const requiredFields = [
      { field: 'selectedCategory', msg: '请选择类别' },
      { field: 'description', msg: '请填写描述' },
      { field: 'images', msg: '请选择图片' },
      { field: 'contactName', msg: '请填写联系人姓名' },
      { field: 'phoneNumber', msg: '请填写联系电话' }
    ];
    for (const field of requiredFields) {
      if (!this.data[field.field]) {
        wx.showToast({
          title: field.msg,
          icon: 'none'
        });
        return false;
      }
    }
    return true;
  },
  submitRepairRequest: function () {
    if (!this.validateForm()) return;

    const requestData = {
      building: this.data.building,
      roomNumber: this.data.roomNumber,
      category: this.data.selectedCategory,
      description: this.data.description,
      images: this.data.images,
      contactName: this.data.contactName,
      phoneNumber: this.data.phoneNumber
    };

    // 更新API路径
    wx.request({
      url: `${getApp().globalData.baseUrl}/api/maintenance/submit`, // 修改为正确的路径
      method: 'POST',
      data: requestData,
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: '报修提交成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '提交失败：' + res.data.message,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  }
});