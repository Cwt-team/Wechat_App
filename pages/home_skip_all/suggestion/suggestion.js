const app = getApp();

Page({
  data: {
    types: ['投诉', '建议'],
    selectedType: '请选择类型',
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
    const { selectedType, content, images } = this.data;
    if (selectedType === '请选择类型' || !content) {
      wx.showToast({
        title: '请填写类型和内容',
        icon: 'none'
      });
      return;
    }

    console.log('开始提交投诉建议:', {
      type: selectedType,
      content: content,
      imageCount: images.length
    });

    wx.showLoading({ title: '提交中...' });

    // 如果没有图片，直接提交表单
    if (images.length === 0) {
      this.submitSuggestionData([]);
      return;
    }

    // 上传图片
    let uploadedImages = [];
    let uploadCount = 0;

    images.forEach((tempFilePath, index) => {
      console.log(`开始上传第${index + 1}张图片`);
      wx.uploadFile({
        url: app.globalData.apiBaseUrl + '/api/upload/image',
        filePath: tempFilePath,
        name: 'file',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        formData: {
          'newName': `suggestion_${Date.now()}_${index}.jpg`
        },
        success: (res) => {
          console.log(`第${index + 1}张图片上传结果:`, res);
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            uploadedImages.push(data.data.url);
          }
        },
        complete: () => {
          uploadCount++;
          console.log(`图片上传进度: ${uploadCount}/${images.length}`);
          if (uploadCount === images.length) {
            this.submitSuggestionData(uploadedImages);
          }
        }
      });
    });
  },

  // 提交建议数据到服务器
  submitSuggestionData: function(uploadedImages) {
    console.log('准备提交表单数据:', {
      type: this.data.selectedType,
      content: this.data.content,
      images: uploadedImages
    });

    wx.request({
      url: app.globalData.apiBaseUrl + '/api/suggestion/submit',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        type: this.data.selectedType === '投诉' ? 'complaint' : 'suggestion',
        content: this.data.content,
        images: uploadedImages
      },
      success: (res) => {
        console.log('提交投诉建议响应:', res.data);
        wx.hideLoading();
        
        if (res.data.code === 200) {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 2000
          });
          // 清空表单
          this.setData({
            selectedType: '请选择类型',
            content: '',
            images: []
          });
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('提交投诉建议失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  navigateToHistory: function () {
    console.log('跳转到历史记录页面');
    wx.navigateTo({
      url: '/pages/home_skip_all/suggestion/suggestionhistory/suggestionhistory'
    });
  }
});