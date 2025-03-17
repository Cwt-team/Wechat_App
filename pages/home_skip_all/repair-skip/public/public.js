Page({
  data: {
    formData: {  // 集中管理表单数据
      building: '',  // 楼栋
      roomNumber: '',  // 房间号
      selectedCategory: '请选择类别',  // 维修类别
      description: '',  // 问题描述
      contactName: '',  // 联系人
      phoneNumber: '',  // 联系电话
      selectedDate: '请选择日期',  // 预约日期
      selectedTime: '请选择时间'  // 预约时间
    },
    metaData: {  // 静态配置数据
      categories: ['电器', '水管', '家具', '其他'],  // 维修类别选项
      maxImages: 9  // 最大图片数量
    },
    images: [],  // 上传的图片列表
    showProcessFlow: false  // 是否显示处理流程
  },

  // 通用输入处理函数
  handleInput: function (field) {
    return (e) => {
      this.setData({
        [`formData.${field}`]: e.detail.value
      });
    };
  },

  // 维修类别选择事件
  onCategoryChange: function (e) {
    const selectedCategory = this.data.metaData.categories[e.detail.value];
    this.setData({
      'formData.selectedCategory': selectedCategory
    });
  },

  // 日期选择事件
  onDateChange: function (e) {
    this.setData({
      'formData.selectedDate': e.detail.value
    });
  },

  // 时间选择事件
  onTimeChange: function (e) {
    this.setData({
      'formData.selectedTime': e.detail.value
    });
  },

  // 图片选择处理
  chooseImage: function () {
    const that = this;
    wx.chooseImage({
      count: this.data.metaData.maxImages - this.data.images.length,
      sizeType: ['compressed'],  // 使用压缩图片
      sourceType: ['album', 'camera'],
      success(res) {
        const newImages = that.data.images.concat(res.tempFilePaths);
        that.setData({
          images: newImages.slice(0, that.data.metaData.maxImages)
        });
      }
    });
  },

  // 表单验证
  validateForm: function () {
    const { formData } = this.data;
    const requiredFields = [
      { field: 'building', msg: '请填写楼栋信息' },
      { field: 'roomNumber', msg: '请填写房间号' },
      { field: 'selectedCategory', value: '请选择类别', msg: '请选择维修类型' },
      { field: 'description', msg: '请填写问题描述' },
      { field: 'contactName', msg: '请填写联系人' },
      { field: 'phoneNumber', msg: '请填写联系电话' },
      { field: 'selectedDate', value: '请选择日期', msg: '请选择预约日期' },
      { field: 'selectedTime', value: '请选择时间', msg: '请选择预约时间' }
    ];

    for (const { field, value, msg } of requiredFields) {
      const fieldValue = formData[field];
      if (value ? fieldValue === value : !fieldValue) {
        wx.showToast({ title: msg, icon: 'none' });
        return false;
      }
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phoneNumber)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return false;
    }

    return true;
  },

  // 提交报修请求
  submitRepairRequest: function () {
    if (!this.validateForm()) return;

    const { formData } = this.data;

    // 准备传递给处理流程页面的数据
    const requestData = {
      building: formData.building,
      roomNumber: formData.roomNumber,
      selectedCategory: formData.selectedCategory,
      description: formData.description,
      contactName: formData.contactName,
      phoneNumber: formData.phoneNumber,
      appointmentDate: formData.selectedDate,
      appointmentTime: formData.selectedTime
    };

    // 跳转到处理流程页面并传递数据
    wx.navigateTo({
      url: '/pages/home_skip_all/repair-skip/processFlow/processFlow',
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', requestData);
      }
    });
  },

  // 事件绑定简写
  onBuildingInput: function (e) { this.handleInput('building')(e); },
  onRoomInput: function (e) { this.handleInput('roomNumber')(e); },
  onDescriptionInput: function (e) { this.handleInput('description')(e); },
  onContactInput: function (e) { this.handleInput('contactName')(e); },
  onPhoneInput: function (e) { this.handleInput('phoneNumber')(e); },

  // 流程确认
  confirmProcess: function () {
    wx.showToast({ title: '事件已完成', icon: 'success' });
    this.setData({ showProcessFlow: false });
  },

  // 查看历史报修
  viewHistory() {
    wx.navigateTo({
      url: '../processFlow/repairhistory/repairhistory'
    });
  }
});