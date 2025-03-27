// pages/home_skip_all/repair-skip/public/public.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    token: '',
    communities: [],
    selectedCommunityIndex: -1,
    communityId: '',
    title: '',
    description: '',
    contactName: '',
    contactPhone: '',
    expectedDate: '',
    expectedTime: '',
    images: [],
    repairTypes: [
      { id: 'water_electric', name: '水电维修' },
      { id: 'public_facility', name: '公共设施' },
      { id: 'clean', name: '保洁服务' },
      { id: 'security', name: '安保服务' },
      { id: 'other', name: '其他' }
    ],
    selectedTypeIndex: -1,
    isSubmitting: false,
    today: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取当前日期
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    this.setData({ 
      userInfo,
      token,
      contactName: userInfo.name || '',
      contactPhone: userInfo.phone_number || '',
      today: formattedDate
    });
    
    console.log('用户信息:', userInfo);
    
    // 获取社区信息
    this.fetchCommunities();
  },

  // 获取用户所在社区
  fetchCommunities() {
    console.log('开始获取社区信息');
    wx.showLoading({ title: '加载中' });
    
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';
    
    wx.request({
      url: `${baseUrl}/api/maintenance/community/list`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${this.data.token}`
      },
      success: (res) => {
        console.log('获取社区信息结果:', res.data);
        wx.hideLoading();
        
        if (res.data.code === 200) {
          // 检查返回的数据格式，确保每个社区对象有正确的属性
          const communities = res.data.data.map(item => {
            // 确保每个社区对象有id和community_name属性
            return {
              id: item.id,
              name: item.community_name || '未命名社区'
            };
          });
          
          this.setData({ 
            communities: communities,
            // 如果只有一个社区，默认选中
            selectedCommunityIndex: communities.length === 1 ? 0 : -1,
            communityId: communities.length === 1 ? communities[0].id : ''
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取社区信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取社区信息失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 选择社区
  handleCommunityChange(e) {
    const index = e.detail.value;
    this.setData({ 
      selectedCommunityIndex: index,
      communityId: this.data.communities[index].id
    });
  },

  // 选择报修类型
  handleTypeChange(e) {
    const index = e.detail.value;
    this.setData({ selectedTypeIndex: index });
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
      camera: 'back',
      success: (res) => {
        console.log('选择图片成功:', res);
        let tempImages = this.data.images;
        res.tempFiles.forEach(file => {
          tempImages.push(file.tempFilePath);
        });
        this.setData({
          images: tempImages
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.images
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    let images = this.data.images;
    images.splice(index, 1);
    this.setData({
      images: images
    });
  },

  // 表单验证
  validateForm() {
    // 检查是否选择了社区
    if (this.data.selectedCommunityIndex === -1) {
      wx.showToast({
        title: '请选择所在社区',
        icon: 'none'
      });
      return false;
    }
    
    // 检查是否选择了报修类型
    if (this.data.selectedTypeIndex === -1) {
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
    const repairType = this.data.repairTypes[this.data.selectedTypeIndex].id;

    const formData = {
      communityId: this.data.communityId,
      // 公共区域报修，无需指定具体房屋
      houseId: 0,
      title: this.data.title,
      description: this.data.description,
      type: repairType,
      contactName: this.data.contactName,
      contactPhone: this.data.contactPhone,
      expectedDate: this.data.expectedDate || '',
      expectedTime: this.data.expectedTime || '',
      isPublic: true  // 标记为公共区域报修
    };

    console.log('提交公共区域报修数据:', formData);

    // 先上传图片，再提交表单
    if (this.data.images.length > 0) {
      this.uploadImages(formData);
    } else {
      // 没有图片，直接提交表单
      this.submitFormData(formData, baseUrl);
    }
  },

  // 上传图片
  uploadImages(formData) {
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';
    const images = this.data.images;
    let uploadedImages = [];
    let uploadCount = 0;
    
    wx.showLoading({ title: '上传图片中...' });
    
    // 逐个上传图片
    images.forEach((imagePath, index) => {
      wx.uploadFile({
        url: `${baseUrl}/api/upload/image`,
        filePath: imagePath,
        name: 'image',
        header: {
          'Authorization': `Bearer ${this.data.token}`
        },
        success: (res) => {
          try {
            const result = JSON.parse(res.data);
            if (result.code === 200) {
              uploadedImages.push(result.data.url);
            } else {
              console.error('上传图片失败:', result.message);
            }
          } catch (e) {
            console.error('解析上传结果失败:', e);
          }
        },
        complete: () => {
          uploadCount++;
          if (uploadCount === images.length) {
            // 所有图片上传完成，提交表单
            formData.images = uploadedImages;
            this.submitFormData(formData, baseUrl);
          }
        }
      });
    });
  },

  // 提交表单数据
  submitFormData(formData, baseUrl) {
    wx.request({
      url: `${baseUrl}/api/maintenance/submit`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.data.token}`
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