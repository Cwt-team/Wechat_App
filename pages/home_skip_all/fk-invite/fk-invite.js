const app = getApp();

Page({
    data: {
      visitDate: '请选择日期',
      visitTime: '请选择时间',
      visitorName: '',
      visitorPhone: '',
      remark: '',
      visitorCode: '',
      isLoggedIn: false,
      visitorHistory: []
    },
  
    onLoad: function() {
      // 检查登录状态
      this.checkLoginStatus();
    },
  
    onShow: function() {
      // 如果已登录，获取访客历史记录
      if (this.data.isLoggedIn) {
        this.getVisitorHistory();
      }
    },
  
    checkLoginStatus: function() {
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');
      
      console.log('当前token:', token);
      console.log('当前用户信息:', userInfo);
      
      if (token && userInfo) {
        this.setData({
          isLoggedIn: true
        });
        this.getVisitorHistory();
      } else {
        this.setData({
          isLoggedIn: false
        });
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
      }
    },
  
    getVisitorHistory: function() {
      const token = wx.getStorageSync('token');
      
      if (!token) {
        console.error('获取访客历史失败: 未找到token');
        return;
      }
      
      wx.showLoading({
        title: '加载中...',
      });
      
      console.log('发送请求获取访客历史，token:', token);
      
      wx.request({
        url: 'http://localhost:3000/api/visitor-invitation',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + token
        },
        success: (res) => {
          wx.hideLoading();
          console.log('访客历史请求响应:', res.data);
          
          if (res.data.code === 200) {
            console.log('获取访客历史成功:', res.data.data);
            this.setData({
              visitorHistory: res.data.data
            });
          } else if (res.data.code === 401) {
            console.error('token无效或已过期');
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            });
            // 可以在这里添加重新登录的逻辑
          } else {
            console.error('获取访客历史失败:', res.data);
            wx.showToast({
              title: res.data.message || '获取历史记录失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('请求访客历史失败:', err);
          wx.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        }
      });
    },
  
    onVisitDateChange: function (e) {
      this.setData({
        visitDate: e.detail.value
      });
    },
  
    onVisitTimeChange: function (e) {
      this.setData({
        visitTime: e.detail.value
      });
    },
  
    onVisitorNameInput: function (e) {
      this.setData({
        visitorName: e.detail.value
      });
    },
  
    onVisitorPhoneInput: function (e) {
      this.setData({
        visitorPhone: e.detail.value
      });
    },
  
    onRemarkInput: function (e) {
      this.setData({
        remark: e.detail.value
      });
    },
  
    generateVisitorCode: function () {
      if (!this.data.isLoggedIn) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      const { visitDate, visitTime, visitorName } = this.data;
  
      if (visitDate === '请选择日期' || visitTime === '请选择时间' || !visitorName) {
        wx.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
  
      const token = wx.getStorageSync('token');
      
      wx.showLoading({
        title: '生成中...',
      });
      
      wx.request({
        url: 'http://localhost:3000/api/visitor-invitation',
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + token
        },
        data: {
          visitorName: this.data.visitorName,
          visitorPhone: this.data.visitorPhone,
          visitDate: this.data.visitDate,
          visitTime: this.data.visitTime,
          remark: this.data.remark
        },
        success: (res) => {
          wx.hideLoading();
          
          if (res.data.code === 200) {
            console.log('访客邀请创建成功:', res.data.data);
            
            this.setData({
              visitorCode: res.data.data.visitorCode
            });
            
            // 刷新访客历史
            this.getVisitorHistory();
            
            wx.showToast({
              title: '访客码已生成',
              icon: 'success'
            });
          } else {
            console.error('访客邀请创建失败:', res.data);
            wx.showToast({
              title: res.data.message || '生成失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('请求失败:', err);
          wx.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        }
      });
    },
    navigateToHistory: function () {
        wx.navigateTo({
          url: '/pages/home_skip_all/fk-invite/visitorHistory/visitorHistory',
          success: (res) => {
            res.eventChannel.emit('transferVisitorHistory', {
              visitorHistory: this.data.visitorHistory
            });
          }
        });
      }
  });