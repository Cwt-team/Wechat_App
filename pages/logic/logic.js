const API_CONFIG = require('../../utils/config');
const LoginService = require('../../utils/loginService');

Page({
  data: {
    username: '',
    avatar: '',
    phoneNumber: '',
    verificationCode: '',
    generatedCode: '',
    isWxLogin: false, // 用于标记是否为微信登录
    isAgree: false,
    userInfo: null,
    hasUserInfo: false
  },
  onPhoneInput: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },
  onCodeInput: function(e) {
    this.setData({
      verificationCode: e.detail.value
    });
  },
  onSendCode: async function() {
    const phoneNumber = this.data.phoneNumber;
    if (!this.validatePhone(phoneNumber)) {
      return wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
    }

    try {
      await LoginService.sendVerifyCode(phoneNumber);
      wx.showToast({ title: '验证码已发送', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: error.message || '发送失败', icon: 'none' });
    }
  },
  onPhoneLogin: async function() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
      return;
    }
    
    const { phoneNumber, verificationCode } = this.data;
    if (!this.validatePhone(phoneNumber) || !verificationCode) {
      return wx.showToast({ title: '请输入正确的手机号和验证码', icon: 'none' });
    }

    try {
      const res = await LoginService.phoneLogin(phoneNumber, verificationCode);
      if (res.code === 200) {
        this.handleLoginSuccess(res.data);
      } else {
        wx.showToast({ title: res.message, icon: 'none' });
      }
    } catch (error) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },
  onWxLogin: async function() {
    if (!this.data.isAgree) {
      return wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
    }

    wx.showLoading({ title: '登录中...' });

    try {
      // 获取用户信息
      const userProfile = await wx.getUserProfile({
        desc: '用于完善会员资料'
      });
      
      console.log('获取用户信息成功:', userProfile.userInfo);

      // 获取登录凭证
      const loginRes = await wx.login();
      console.log('获取登录凭证成功:', loginRes.code);

      // 调用登录接口
      const res = await LoginService.wechatLogin(loginRes.code, userProfile.userInfo);
      
      if (res.code === 200) {
        // 保存用户信息并跳转
        this.handleLoginSuccess(res.data);
      } else {
        wx.showToast({
          title: res.message || '登录失败',
          icon: 'none'
        });
      }

    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
  handleLoginSuccess: function(data) {
    console.log('登录成功,保存数据:', data);
    wx.setStorageSync('token', data.token);
    wx.setStorageSync('userInfo', data.userInfo);
    wx.switchTab({ url: '/pages/home/home' });
  },
  getUserProfile: async function() {
    try {
      const res = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });
      return res.userInfo;
    } catch (error) {
      throw new Error('获取用户信息失败');
    }
  },
  getLoginCode: async function() {
    const res = await wx.login();
    if (!res.code) {
      throw new Error('获取登录凭证失败');
    }
    return res.code;
  },
  validatePhone: function(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },
  onCheckboxChange(e) {
    this.setData({
      isAgree: e.detail.value.length > 0
    });
  },
  onGetUserInfo: async function(e) {
    if (!this.data.isAgree) {
      return wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
    }

    if (e.detail.errMsg !== 'getUserInfo:ok') {
      return wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    }

    wx.showLoading({ title: '登录中...' });
    
    try {
      console.log('开始获取用户信息:', e.detail.userInfo);
      
      // 获取手机号
      const phoneRes = await wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          console.log('获取用户信息成功:', res.userInfo);
        }
      });

      // 获取登录凭证
      const loginCode = await this.getLoginCode();
      console.log('获取登录凭证成功:', loginCode);

      // 调用登录接口
      const res = await LoginService.wechatLogin({
        code: loginCode,
        userInfo: phoneRes.userInfo
      });
      
      console.log('微信登录响应:', res);

      if (res.code === 200) {
        this.handleLoginSuccess(res.data);
      } else {
        wx.showToast({
          title: res.message || '登录失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
  skipLogin: function() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
});
