// pages/home_skip_all/community_rating/community_rating.js
const app = getApp();

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
    ratingHistory: [],
    communityId: 0,
    communityName: '',
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('社区评价页面加载');
    
    // 获取用户所在社区信息
    this.getUserCommunity();
    
    // 初始化星级评分
    this.setData({
      stars: [0, 1, 2, 3, 4]
    });
    
    // 加载评价历史数据，但不跳转
    // this.loadRatingHistory(); // 注释掉这行或确保 loadRatingHistory 不会自动跳转
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log('社区评价页面显示');
    // 页面显示时可以刷新数据，但不要跳转
    // this.loadRatingHistory(); // 确保这里不会导致自动跳转
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
  submitRating: function() {
    console.log('提交评价按钮点击');
    const that = this;
    
    if (this.data.submitting) {
      return;
    }
    
    const rating = this.data.currentRating;
    const content = this.data.content;
    
    if (rating === 0) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      });
      return;
    }
    
    if (!content.trim()) {
      wx.showToast({
        title: '请填写评价内容',
        icon: 'none'
      });
      return;
    }
    
    // 检查社区ID
    if (!this.data.communityId) {
      console.log('未获取到社区ID，尝试从缓存获取');
      const userCommunity = wx.getStorageSync('userCommunity');
      if (userCommunity && userCommunity.communityId) {
        this.setData({
          communityId: userCommunity.communityId,
          communityName: userCommunity.communityName
        });
      } else {
        console.log('缓存中也没有社区信息，重新获取');
        this.getUserCommunity();
        wx.showToast({
          title: '未获取到社区信息，请重试',
          icon: 'none'
        });
        return;
      }
    }
    
    this.setData({ submitting: true });
    
    // 准备评价数据
    const ratingData = {
      communityId: this.data.communityId,
      rating: rating,
      content: content
    };
    
    console.log('准备提交评价数据:', ratingData);
    
    // 如果有图片，先上传图片
    if (this.data.images.length > 0) {
      this.uploadImages(this.data.images, ratingData);
    } else {
      this.submitRatingToServer(ratingData, []);
    }
  },
  
  // 上传图片并提交评价
  uploadImages: function(images, ratingData) {
    const that = this;
    const uploadedImages = [];
    
    // 显示上传中提示
    wx.showLoading({
      title: '正在上传图片...',
    });
    
    // 上传图片
    let uploadCount = 0;
    for (let i = 0; i < images.length; i++) {
      wx.uploadFile({
        url: app.globalData.apiBaseUrl + '/api/upload/image',
        filePath: images[i],
        name: 'file',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success(res) {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            uploadedImages.push(data.data.url);
          }
        },
        complete() {
          uploadCount++;
          // 所有图片上传完成后提交评价
          if (uploadCount === images.length) {
            wx.hideLoading();
            that.submitRatingToServer(ratingData, uploadedImages);
          }
        }
      });
    }
  },
  
  // 向服务器提交评价
  submitRatingToServer: function(ratingData, uploadedImages) {
    const that = this;
    
    // 确保有社区ID
    if (!ratingData.communityId) {
      console.error('提交时仍未获取到社区ID');
      wx.showToast({
        title: '未获取到社区信息',
        icon: 'none'
      });
      that.setData({ submitting: false });
      return;
    }
    
    console.log('最终提交数据:', {
      ...ratingData,
      images: uploadedImages
    });
    
    // 替换本地图片路径为上传后的URL
    ratingData.images = uploadedImages;
    
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/community/review',
      method: 'POST',
      data: ratingData,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success(res) {
        console.log('提交评价响应:', res.data);
        if (res.data.code === 200) {
          wx.showToast({
            title: '评价提交成功',
            icon: 'success'
          });
          
          // 重置表单
          that.setData({
            currentRating: 0,
            content: '',
            images: [],
            submitting: false
          });
          
          // 刷新评价历史
          that.loadRatingHistory();
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
            icon: 'none'
          });
          that.setData({ submitting: false });
        }
      },
      fail(err) {
        console.error('提交评价请求失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        that.setData({ submitting: false });
      }
    });
  },
  
  // 加载评价历史
  loadRatingHistory: function() {
    const that = this;
    
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/community/review/history',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success(res) {
        console.log('获取评价历史响应:', res.data);
        if (res.data.code === 200) {
          that.setData({
            ratingHistory: res.data.data || []
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取历史失败',
            icon: 'none'
          });
        }
      },
      fail(err) {
        console.error('请求评价历史失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 查看历史评价
  viewHistory: function() {
    console.log('查看历史评价按钮点击');
    
    // 导航到历史页面
    wx.navigateTo({
      url: './rating_history/rating_history',
      success: function(res) {
        console.log('导航到历史页面成功');
      },
      fail: function(err) {
        console.error('导航到历史页面失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取用户所在社区
  getUserCommunity: function() {
    const that = this;
    console.log('获取用户社区信息，API基础URL:', app.globalData.apiBaseUrl);
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/community/user-community`,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success(res) {
        console.log('获取用户社区信息响应:', res.data);
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            const communityData = res.data.data;
            console.log('设置社区信息:', communityData);
            
            that.setData({
              communityId: communityData.communityId,
              communityName: communityData.communityName
            });
            
            // 存储社区信息到本地
            wx.setStorageSync('userCommunity', communityData);
          } else if (res.data.code === 401) {
            console.log('token失效，尝试重新登录');
            // 重新登录
            wx.login({
              success(loginRes) {
                if (loginRes.code) {
                  // 重新获取token
                  wx.request({
                    url: app.globalData.apiBaseUrl + '/api/login/wechat',
                    method: 'POST',
                    data: {
                      code: loginRes.code
                    },
                    success(loginResponse) {
                      if (loginResponse.data.code === 200) {
                        wx.setStorageSync('token', loginResponse.data.data.token);
                        // 重试获取社区信息
                        that.getUserCommunity();
                      }
                    }
                  });
                }
              }
            });
          } else {
            console.error('获取用户社区信息失败:', res.data.message);
            wx.showToast({
              title: res.data.message || '获取社区信息失败',
              icon: 'none'
            });
          }
        }
      },
      fail(err) {
        console.error('获取用户社区信息请求失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 预览图片
  previewImage: function(e) {
    const current = e.currentTarget.dataset.current;
    const urls = e.currentTarget.dataset.urls;
    wx.previewImage({
      current: current,
      urls: urls
    });
  },

  // 查看评价历史
  viewRatingHistory: function() {
    this.viewHistory();
  },

  goBack: function() {
    // 尝试返回上一页
    wx.navigateBack({
      fail: function() {
        // 如果返回失败，则跳转到首页
        wx.switchTab({
          url: '/pages/home/home'
        });
      }
    });
  }
})