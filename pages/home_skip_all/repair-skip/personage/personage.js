const app = getApp();
const baseUrl = app.globalData.baseUrl;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    token: null,
    houses: [],
    selectedHouse: null,
    communityId: '',
    houseId: '',
    title: '',
    description: '',
    contactName: '',
    contactPhone: '',
    expectedDate: '',
    expectedTime: '',
    images: [],
    repairTypes: [
      { id: 'water_electric', name: '水电维修' },
      { id: 'decoration', name: '装修维修' },
      { id: 'furniture', name: '家具维修' },
      { id: 'other', name: '其他' }
    ],
    selectedType: '',
    isSubmitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取用户信息和token
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token'); // 直接获取token
    
    this.setData({ 
      userInfo,
      token, // 将token单独存储在data中
      contactName: userInfo?.name || '',
      contactPhone: userInfo?.phone || ''
    });
    
    // 检查token是否存在
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '登录信息已过期，请重新登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    // 获取用户房屋信息
    console.log('开始获取用户房屋信息');
    this.getUserHouses();
  },

  /**
   * 获取用户房屋信息
   */
  getUserHouses() {
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';
    wx.request({
      url: `${baseUrl}/api/maintenance/user-houses`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${this.data.token}` // 使用data中的token
      },
      success: (res) => {
        console.log('获取用户房屋信息成功:', res.data);
        if (res.data.code === 200 && res.data.data) {
          this.setData({
            houses: res.data.data
          });
        } else if (res.data.code === 401) {
          // 处理401认证失败情况
          wx.showModal({
            title: '提示',
            content: '登录信息已过期，请重新登录',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                // 跳转到登录页面
                wx.navigateTo({
                  url: '/pages/login/login'
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取房屋信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取用户房屋信息失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 选择房屋
  handleHouseChange(e) {
    const index = e.detail.value;
    const selectedHouse = this.data.houses[index];
    this.setData({ 
      selectedHouse,
      communityId: selectedHouse.community_id,
      houseId: selectedHouse.id
    });
  },

  /**
   * 处理报修类型选择
   */
  handleTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedTypeIndex: parseInt(index),
      selectedType: this.data.repairTypes[index].id
    });
    console.log('选择的报修类型:', this.data.repairTypes[index].name, this.data.repairTypes[index].id);
  },

  // 输入标题
  handleTitleInput(e) {
    this.setData({ title: e.detail.value });
  },

  // 输入问题描述
  handleDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 输入联系人
  handleContactNameInput(e) {
    this.setData({ contactName: e.detail.value });
  },

  // 输入联系电话
  handleContactPhoneInput(e) {
    this.setData({ contactPhone: e.detail.value });
  },

  // 选择预约日期
  handleDateChange(e) {
    this.setData({ expectedDate: e.detail.value });
  },

  // 选择预约时间
  handleTimeChange(e) {
    this.setData({ expectedTime: e.detail.value });
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 3 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        console.log('选择图片成功:', res);
        
        // 获取新选择的图片临时路径
        const newImages = res.tempFiles.map(file => file.tempFilePath);
        
        // 合并已有图片和新选择的图片
        this.setData({
          images: [...this.data.images, ...newImages]
        });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url, // 当前显示图片的链接
      urls: this.data.images // 所有图片的链接列表
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.slice();
    images.splice(index, 1);
    this.setData({ images });
  },

  // 验证表单
  validateForm() {
    // 检查是否选择了房屋
    if (!this.data.selectedHouse) {
      wx.showToast({
        title: '请选择房屋',
        icon: 'none'
      });
      return false;
    }
    
    // 检查是否选择了报修类型
    if (this.data.selectedTypeIndex < 0 || !this.data.selectedType) {
      wx.showToast({
        title: '请选择报修类型',
        icon: 'none'
      });
      return false;
    }
    
    // 检查标题是否填写
    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请输入报修标题',
        icon: 'none'
      });
      return false;
    }
    
    // 检查描述是否填写
    if (!this.data.description.trim()) {
      wx.showToast({
        title: '请输入问题描述',
        icon: 'none'
      });
      return false;
    }
    
    // 检查联系人是否填写
    if (!this.data.contactName.trim()) {
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none'
      });
      return false;
    }
    
    // 检查联系电话是否填写
    if (!this.data.contactPhone.trim()) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 提交报修
  submitRepair() {
    if (!this.validateForm()) return;

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '提交中' });

    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';
    
    const formData = {
      communityId: this.data.selectedHouse.community_id,
      houseId: this.data.selectedHouse.id, // 确保传递房屋ID
      title: this.data.title,
      description: this.data.description,
      type: this.data.selectedType,  // 确保选择的类型ID正确传递
      contactName: this.data.contactName,
      contactPhone: this.data.contactPhone,
      expectedDate: this.data.expectedDate || '',
      expectedTime: this.data.expectedTime || '',
      isPublic: false // 标记为个人区域报修
    };

    console.log('提交个人区域报修数据:', formData);

    // 先上传图片，再提交表单
    if (this.data.images.length > 0) {
      this.uploadImages(formData);
    } else {
      // 没有图片，直接提交表单
      this.submitFormData(formData);
    }
  },

  // 上传图片
  uploadImages(formData) {
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';
    const uploadedImages = [];
    let uploadCount = 0;
    
    wx.showLoading({
      title: `上传图片 1/${this.data.images.length}`,
      mask: true
    });
    
    const uploadSingleImage = (index) => {
      if (index >= this.data.images.length) {
        // 所有图片上传完成
        formData.images = uploadedImages;
        this.submitFormData(formData);
        return;
      }
      
      wx.showLoading({
        title: `上传图片 ${index+1}/${this.data.images.length}`,
        mask: true
      });
      
      wx.uploadFile({
        url: `${baseUrl}/api/maintenance/upload`,
        filePath: this.data.images[index],
        name: 'image',
        header: {
          'Authorization': `Bearer ${this.data.token}` // 使用data中的token
        },
        success: (uploadRes) => {
          try {
            const data = JSON.parse(uploadRes.data);
            console.log('图片上传结果:', data);
            
            if (data.code === 200) {
              uploadedImages.push(data.data.url);
            } else {
              console.error('图片上传失败:', data.message);
            }
          } catch (e) {
            console.error('解析上传结果失败:', e);
          }
        },
        fail: (err) => {
          console.error('图片上传请求失败:', err);
        },
        complete: () => {
          uploadCount++;
          if (uploadCount === this.data.images.length) {
            // 所有图片上传已尝试
            formData.images = uploadedImages;
            this.submitFormData(formData);
          } else {
            // 上传下一张
            uploadSingleImage(index + 1);
          }
        }
      });
    };
    
    // 开始上传第一张
    uploadSingleImage(0);
  },

  // 提交表单数据
  submitFormData(formData) {
    console.log('提交个人区域报修数据:', formData);
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';

    wx.request({
      url: `${baseUrl}/api/maintenance/submit`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.data.token}` // 使用data中的token
      },
      data: formData,
      success: (res) => {
        console.log('提交报修结果:', res.data);
        wx.hideLoading();
        this.setData({ isSubmitting: false });

        if (res.data.code === 200) {
          wx.showToast({
            title: '报修提交成功',
            icon: 'success'
          });
          // 跳转到报修详情页
          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/home_skip_all/repair-skip/detail/detail?id=${res.data.data.id}`
            });
          }, 1500);
        } else if (res.data.code === 401) {
          // 处理401认证失败情况
          wx.showModal({
            title: '提示',
            content: '登录信息已过期，请重新登录',
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                // 跳转到登录页面
                wx.navigateTo({
                  url: '/pages/login/login'
                });
              }
            }
          });
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('提交报修请求失败:', err);
        wx.hideLoading();
        this.setData({ isSubmitting: false });
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 查看历史报修
  viewHistory() {
    wx.navigateTo({
      url: '/pages/home_skip_all/repair-skip/repairhistory/repairhistory'
    });
  }
})