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
    hasUserInfo: false,
    loginType: 'account', // 默认为账号密码登录
    account: '',
    password: ''
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
      wx.request({
        url: 'http://localhost:3000/api/login/wechat',
        method: 'POST',
        data: {
          code: loginRes.code,
          userInfo: userProfile.userInfo
        },
        success: (res) => {
          wx.hideLoading();
          
          if (res.data.code === 200) {
            // 登录成功
            wx.setStorageSync('userInfo', res.data.data.userInfo);
            wx.setStorageSync('token', res.data.data.token);
            
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/home/home'
                  });
                }, 1500);
              }
            });
          } else if (res.data.code === 201) {
            // 需要绑定账号
            wx.showModal({
              title: '提示',
              content: '请绑定账号以完成登录',
              confirmText: '去绑定',
              cancelText: '取消',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  // 保存openid，跳转到绑定页面
                  wx.navigateTo({
                    url: '/pages/bind-account/bind-account?openid=' + res.data.data.openid
                  });
                }
              }
            });
          } else {
            // 其他错误
            wx.showToast({
              title: res.data.message || '登录失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
          console.error('微信登录请求失败:', err);
        }
      });
    } catch (error) {
      wx.hideLoading();
      console.error('微信登录失败:', error);
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
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
    console.log('用户选择暂不登录');
    wx.switchTab({
      url: '/pages/home/home',
      success: () => {
        console.log('跳转到首页成功');
      },
      fail: (err) => {
        console.error('跳转到首页失败:', err);
      }
    });
  },
  // 切换登录方式
  switchTab: function(e) {
    this.setData({
      loginType: e.currentTarget.dataset.type
    });
  },
  
  // 输入账号
  inputAccount: function(e) {
    this.setData({
      account: e.detail.value
    });
  },
  
  // 输入密码
  inputPassword: function(e) {
    this.setData({
      password: e.detail.value
    });
  },
  
  // 切换协议同意状态
  toggleAgreement: function() {
    this.setData({
      isAgree: !this.data.isAgree
    });
  },
  
  // 账号密码登录
  accountLogin: function() {
    const { account, password } = this.data;
    
    if (!account || !password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '登录中...',
    });
    
    // 调用后端登录接口
    wx.request({
      url: 'http://localhost:3000/api/login/account',
      method: 'POST',
      data: {
        account: account,
        password: password
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.data.code === 200) {
          // 登录成功，保存用户信息和token
          wx.setStorageSync('userInfo', res.data.data.userInfo);
          wx.setStorageSync('token', res.data.data.token);
          
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                wx.switchTab({
                  url: '/pages/home/home'
                });
              }, 1500);
            }
          });
        } else {
          // 登录失败
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        console.error('登录请求失败:', err);
      }
    });
  },
  
  // 处理用户协议勾选
  onAgreementChange: function(e) {
    this.setData({
      isAgree: e.detail.value.length > 0
    });
  }
});
