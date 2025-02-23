const API_CONFIG = require('../../utils/config');
const LoginService = require('../../utils/loginService');

Page({
  data: {
    userInfo: null,
    loading: false
  },

  onLoad: function() {
    console.log('绑定手机号页面加载');
    const wxLoginInfo = wx.getStorageSync('wxLoginInfo');
    if (wxLoginInfo) {
      this.setData({
        userInfo: wxLoginInfo.userInfo
      });
    }
  },

  getPhoneNumber: async function(e) {
    console.log('获取手机号回调:', e.detail);
    
    if (e.detail.errMsg !== "getPhoneNumber:ok") {
      return wx.showToast({
        title: '获取手机号失败',
        icon: 'none'
      });
    }

    try {
      this.setData({ loading: true });

      // 获取存储的登录信息
      const wxLoginInfo = wx.getStorageSync('wxLoginInfo');
      if (!wxLoginInfo || !wxLoginInfo.code) {
        throw new Error('登录信息已失效,请重新登录');
      }

      // 调用后端接口绑定手机号
      const res = await wx.request({
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN.BIND_PHONE}`,
        method: 'POST',
        data: {
          code: e.detail.code,
          wxCode: wxLoginInfo.code,
          userInfo: wxLoginInfo.userInfo
        }
      });

      console.log('绑定手机号响应:', res);

      if (res.statusCode === 200 && res.data.code === 200) {
        // 清除登录信息
        wx.removeStorageSync('wxLoginInfo');
        // 保存token和用户信息
        wx.setStorageSync('token', res.data.data.token);
        wx.setStorageSync('userInfo', res.data.data.userInfo);
        
        wx.showToast({
          title: '绑定成功',
          icon: 'success'
        });

        // 延迟跳转
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 1500);
      } else {
        throw new Error(res.data.message || '绑定失败');
      }
    } catch (error) {
      console.error('绑定失败:', error);
      wx.showToast({
        title: error.message || '绑定失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
}); 