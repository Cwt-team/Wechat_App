const app = getApp();

Page({
  data: {
    repairOrder: {
      orderNumber: '',     // 报修单号 (request_number)
      requestCode: '',     // 报修验证码 (request_code)
      submitDate: '',
      building: '',
      roomNumber: '',
      category: '',
      contactName: '',
      phoneNumber: '',
      appointmentDate: '',
      appointmentTime: '',
      status: 'pending',
      description: ''
    },
    processSteps: [
      { title: '提交报修', description: '等待物业确认', status: 'finish' },
      { title: '物业受理', description: '物业人员处理中', status: 'process' },
      { title: '维修处理', description: '维修人员上门处理', status: 'wait' },
      { title: '完成维修', description: '维修工作已完成', status: 'wait' }
    ]
  },

  onLoad: function (options) {
    // 日志输出当前baseUrl，便于调试
    console.log('当前baseUrl:', app.globalData.baseUrl);

    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      console.log('接收到的报修数据:', data);

      // 如果是从历史记录页面进入，直接使用传递的数据
      if (data.orderNumber) {
        this.setData({
          repairOrder: data
        });
      } else {
        // 如果是新提交的报修，生成新的报修单号
        const orderNumber = this.generateRequestNumber();
        const requestCode = this.generateRequestCode();

        this.setData({
          'repairOrder.orderNumber': orderNumber,
          'repairOrder.requestCode': requestCode,
          'repairOrder.submitDate': this.formatDate(new Date()),
          'repairOrder.building': data.building,
          'repairOrder.roomNumber': data.roomNumber,
          'repairOrder.category': data.category,
          'repairOrder.contactName': data.contactName,
          'repairOrder.phoneNumber': data.phoneNumber,
          'repairOrder.appointmentDate': data.appointmentDate,
          'repairOrder.appointmentTime': data.appointmentTime,
          'repairOrder.description': data.description
        });
        // 保存到本地存储
        this.saveRepairOrder();

        // 尝试上传到服务器
        this.uploadToServer();
      }
    });
  },

  // 生成符合格式的报修单号：MR + 日期 + 4位随机数
  generateRequestNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MR${dateStr}${randomStr}`;
  },

  // 生成报修验证码：PR + 10位随机字母数字
  generateRequestCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'PR'; // 个人报修前缀
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  saveRepairOrder() {
    let repairHistory = wx.getStorageSync('repairHistory') || [];
    repairHistory.unshift(this.data.repairOrder);
    wx.setStorageSync('repairHistory', repairHistory);
  },

  viewHistory() {
    wx.navigateTo({
      url: './repairhistory/repairhistory'
    });
  },

  confirmProcess: function () {
    // 模拟事件完成，返回报修界面
    wx.showToast({
      title: '事件已完成',
      icon: 'success'
    });
    // 返回到上一个页面
    wx.navigateBack();
  },

  mapCategoryToType(category) {
    // 根据前端分类映射到后端类型
    const typeMap = {
      '水电维修': 'water_electric',
      '装修维修': 'decoration',
      '公共设施': 'public_facility',
      '保洁服务': 'clean',
      '安保服务': 'security',
      '其他': 'other'
    };
    return typeMap[category] || 'other';
  },

  uploadToServer() {
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 获取房屋信息
    const userInfo = wx.getStorageSync('userInfo');
    let houseInfo = null;

    // 尝试从用户全局信息获取
    if (userInfo && userInfo.house_id) {
      houseInfo = {
        id: parseInt(userInfo.house_id) || userInfo.house_id,
        community_id: parseInt(userInfo.community_id) || userInfo.community_id || 1,
        building: userInfo.building,
        roomNumber: userInfo.room_number
      };
    }
    // 如果用户全局信息中没有，则使用表单信息构建
    else if (this.data.repairOrder.building && this.data.repairOrder.roomNumber) {
      houseInfo = {
        // 尝试转为数字类型，因为服务器可能期望数字而非字符串
        id: parseInt(this.data.repairOrder.roomNumber) || this.data.repairOrder.roomNumber,
        community_id: 1, // 确保有默认值
        building: this.data.repairOrder.building,
        roomNumber: this.data.repairOrder.roomNumber
      };
    }

    if (!houseInfo) {
      wx.showToast({
        title: '未获取到房屋信息',
        icon: 'none'
      });
      return;
    }

    console.log('使用的房屋信息:', houseInfo);

    // 检查baseUrl是否存在
    const app = getApp();
    if (!app.globalData || !app.globalData.baseUrl) {
      wx.showToast({
        title: '系统配置错误，请联系管理员',
        icon: 'none'
      });
      console.error('app.globalData.baseUrl未定义，请检查app.js中的配置');
      return;
    }

    // 准备数据对象 - 确保数据类型符合服务器期望
    const requestData = {
      house_id: parseInt(houseInfo.id) || houseInfo.id,
      community_id: parseInt(houseInfo.community_id) || houseInfo.community_id,
      reporter_name: this.data.repairOrder.contactName || "",
      reporter_phone: this.data.repairOrder.phoneNumber || "",
      title: `${this.data.repairOrder.category}故障报修` || "故障报修",
      description: this.data.repairOrder.description || "",
      type: this.data.repairOrder.category || "其他",
      expected_time: `${this.data.repairOrder.appointmentDate} ${this.data.repairOrder.appointmentTime}` || ""
    };

    // 输出完整请求数据，便于调试
    console.log('提交的报修数据:', requestData);

    // 如果有图片，需要使用特殊处理
    if (this.data.repairOrder.images && this.data.repairOrder.images.length > 0) {
      this.uploadImagesAndSubmit(requestData, token);
    } else {
      // 无图片时直接提交
      this.submitWithoutImages(requestData, token);
    }
  },

  // 无图片提交
  submitWithoutImages(requestData, token) {
    const app = getApp();

    // 获取用户信息和openid
    const userInfo = wx.getStorageSync('userInfo');

    // 添加openid到请求数据中
    if (userInfo && userInfo.openid) {
      requestData.openid = userInfo.openid;
    } else {
      // 尝试从token解析openid
      try {
        const payload = token.split('.')[1];
        const decodedData = wx.getSystemInfoSync().platform === 'devtools'
          ? atob(payload)
          : decodeURIComponent(escape(wx.arrayBufferToBase64(wx.base64ToArrayBuffer(payload))
            .replace(/-/g, '+')
            .replace(/_/g, '/')));

        const tokenData = JSON.parse(decodedData);
        console.log('Token payload:', tokenData);

        if (tokenData && tokenData.openid) {
          requestData.openid = tokenData.openid;
        }
      } catch (error) {
        console.error('解析token错误:', error);
      }
    }

    // 检查所有必要参数是否存在并类型正确
    const requiredParams = ['community_id', 'house_id', 'title', 'description', 'type'];
    const missingParams = [];

    requiredParams.forEach(param => {
      if (requestData[param] === undefined || requestData[param] === null || requestData[param] === '') {
        missingParams.push(param);
      }
    });

    if (missingParams.length > 0) {
      console.error('客户端检测到缺少必要参数:', missingParams);
      wx.showModal({
        title: '表单不完整',
        content: `缺少必要信息: ${missingParams.join(', ')}`,
        showCancel: false
      });
      return;
    }

    // 打印完整的请求数据
    console.log('最终提交的报修数据:', JSON.stringify(requestData));

    wx.request({
      url: `${app.globalData.baseUrl}/api/maintenance/submit`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: requestData,
      success: (res) => {
        wx.hideLoading();
        console.log('报修提交响应详情:', res);

        if (res.statusCode === 200 && res.data.code === 200) {
          wx.showToast({
            title: '报修提交成功',
            icon: 'success'
          });

          // 跳转到成功页面或执行其他操作
          this.setData({
            submitted: true,
            requestNumber: res.data.data.request_number || '未返回单号'
          });
        } else {
          // 显示服务器返回的详细错误信息
          const errorMsg = res.data.message || '提交失败，请重试';
          console.error('服务器返回错误:', errorMsg, res);

          wx.showModal({
            title: '提交失败',
            content: errorMsg,
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('报修提交请求失败详情:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 有图片提交 - 使用小程序的上传文件API
  uploadImagesAndSubmit(requestData, token) {
    const app = getApp();
    const images = this.data.repairOrder.images;

    // 先检查必要参数
    const requiredParams = ['community_id', 'house_id', 'title', 'description', 'type'];
    const missingParams = [];

    requiredParams.forEach(param => {
      if (!requestData[param]) {
        missingParams.push(param);
      }
    });

    if (missingParams.length > 0) {
      console.error('上传图片前检测到缺少必要参数:', missingParams);

      // 显示详细的缺失参数信息
      wx.showToast({
        title: `缺少参数: ${missingParams.join(', ')}`,
        icon: 'none',
        duration: 3000
      });
      return;
    }

    // 图片上传计数
    let uploadedCount = 0;
    const uploadedPaths = [];

    // 依次上传每张图片
    images.forEach((imagePath, index) => {
      wx.uploadFile({
        url: `${app.globalData.baseUrl}/api/file/upload`,
        filePath: imagePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          // 解析响应
          try {
            const responseData = JSON.parse(res.data);

            if (responseData.code === 200 && responseData.data) {
              uploadedPaths.push(responseData.data.url);
              console.log(`图片${index + 1}上传成功:`, responseData.data.url);
            } else {
              console.error(`图片${index + 1}上传失败:`, responseData.message);

              // 显示上传错误信息
              wx.showToast({
                title: `图片上传失败: ${responseData.message}`,
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('解析上传响应失败:', error);
          }
        },
        fail: (err) => {
          console.error(`图片${index + 1}上传请求失败:`, err);
        },
        complete: () => {
          uploadedCount++;

          // 所有图片上传完成后，提交报修信息
          if (uploadedCount === images.length) {
            // 添加上传成功的图片路径
            requestData.images = uploadedPaths;
            this.submitWithoutImages(requestData, token);
          }
        }
      });
    });
  }
});