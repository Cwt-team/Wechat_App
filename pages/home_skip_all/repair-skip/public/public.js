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

  // 页面加载时执行
  onLoad: function () {
    // 自动获取用户房屋信息
    this.getUserHouseInfo();
  },

  // 获取用户房屋信息
  getUserHouseInfo: function () {
    const app = getApp();

    // 首先尝试从全局数据获取
    if (app.globalData && app.globalData.userInfo) {
      const userInfo = app.globalData.userInfo;
      console.log('当前用户信息:', userInfo);

      if (userInfo.house_full_name) {
        const houseParts = userInfo.house_full_name.split('-');

        if (houseParts.length >= 2) {
          this.setData({
            'formData.building': houseParts[0],
            'formData.roomNumber': houseParts[1],
            'formData.contactName': userInfo.name || '',
            'formData.phoneNumber': userInfo.phone || ''
          });
          console.log('已自动填充用户房屋信息');
          return;
        }
      }
    }

    // 尝试从本地存储获取
    const selectedHouse = wx.getStorageSync('selectedHouse');
    if (selectedHouse && selectedHouse.house_full_name) {
      const houseParts = selectedHouse.house_full_name.split('-');
      if (houseParts.length >= 2) {
        this.setData({
          'formData.building': houseParts[0],
          'formData.roomNumber': houseParts[1]
        });
        console.log('从storage获取到房屋信息');

        // 继续获取联系人信息
        this.getUserContactInfo();
        return;
      }
    }

    // 从服务器获取
    this.fetchUserHousesFromServer();
  },

  // 从服务器获取用户房屋列表
  fetchUserHousesFromServer: function () {
    const app = getApp();
    const token = wx.getStorageSync('token');

    if (!token) {
      console.log('用户未登录，无法获取房屋信息');
      return;
    }

    wx.showLoading({
      title: '获取房屋信息...',
    });

    wx.request({
      url: `${app.globalData.baseUrl}/api/user/houses`,  // 可能需要调整API路径
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        wx.hideLoading();
        console.log('服务器返回的房屋列表:', res.data);

        if (res.statusCode === 200 && res.data.data && res.data.data.length > 0) {
          // 使用第一个房屋作为默认
          const defaultHouse = res.data.data[0];

          if (defaultHouse.house_full_name) {
            const houseParts = defaultHouse.house_full_name.split('-');
            if (houseParts.length >= 2) {
              this.setData({
                'formData.building': houseParts[0],
                'formData.roomNumber': houseParts[1]
              });
              console.log('已自动填充房屋信息:', houseParts[0], houseParts[1]);
            }
          }
        }

        // 无论房屋信息是否成功获取，都尝试获取联系人信息
        this.getUserContactInfo();
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取用户房屋列表失败:', err);
        // 即使获取房屋信息失败，仍然尝试获取联系人信息
        this.getUserContactInfo();
      }
    });
  },

  // 新增：获取用户联系信息
  getUserContactInfo: function () {
    const app = getApp();
    const token = wx.getStorageSync('token');

    if (!token) {
      console.log('用户未登录，无法获取联系人信息');
      return;
    }

    // 尝试从token解析用户信息，因为无对应的用户信息API
    this.getUserInfoFromToken(token);

    // 如果需要，也可以尝试从房屋接口获取相关信息
    wx.request({
      url: `${app.globalData.baseUrl}/api/maintenance/user-houses`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        console.log('从房屋接口获取信息:', res.data);

        if (res.statusCode === 200 && res.data.code === 200 && res.data.data) {
          // 可能的用户信息提取逻辑（如果有的话）
          // 但现在主要依靠token解析
        }
      },
      fail: (err) => {
        console.error('获取用户房屋信息请求失败:', err);
      }
    });
  },

  // 从Token解析用户信息 - 优化版本
  getUserInfoFromToken: function (token) {
    if (!token) {
      token = wx.getStorageSync('token');
      if (!token) return;
    }

    try {
      // 解析JWT token的简化版本
      const payload = token.split('.')[1];
      const decodedPayload = wx.getSystemInfoSync().platform === 'devtools'
        ? atob(payload) // 开发者工具使用atob
        : decodeURIComponent(escape(wx.arrayBufferToBase64(wx.base64ToArrayBuffer(payload))
          .replace(/-/g, '+')
          .replace(/_/g, '/')));

      const tokenData = JSON.parse(decodedPayload);
      console.log('从token中解析出的数据:', tokenData);

      // 尝试从token中提取用户信息
      if (tokenData) {
        const userInfo = {
          name: tokenData.name || tokenData.nickName || '',
          phone: tokenData.phone || tokenData.phoneNumber || ''
        };

        console.log('从token提取的用户信息:', userInfo);

        // 只有在有效数据时才更新
        if (userInfo.name || userInfo.phone) {
          this.setData({
            'formData.contactName': userInfo.name,
            'formData.phoneNumber': userInfo.phone
          });
          console.log('已从token填充联系人信息');
        }
      }
    } catch (error) {
      console.error('解析token失败:', error);

      // 如果解析token失败，使用默认值
      const userInfo = getApp().globalData.userInfo;
      if (userInfo) {
        this.setData({
          'formData.contactName': userInfo.name || userInfo.nickName || '',
          'formData.phoneNumber': userInfo.phone || userInfo.phoneNumber || ''
        });
        console.log('使用全局userInfo填充联系人信息');
      }
    }
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
      category: formData.selectedCategory,
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