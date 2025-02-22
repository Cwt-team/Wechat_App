Page({
  data: {
    username: '',
    avatar: '',
    phoneNumber: '',
    verificationCode: '',
    generatedCode: '' // 用于存储生成的验证码
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
  onSendCode: function() {
    const phoneNumber = this.data.phoneNumber;
    if (!phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    // 模拟生成验证码
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.setData({ generatedCode });

    // 模拟发送验证码
    console.log(`验证码已发送到 ${phoneNumber}，验证码是：${generatedCode}`);
    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
  },
  onPhoneLogin: function() {
    const { verificationCode, generatedCode } = this.data;
    if (verificationCode === generatedCode) {
      // 验证成功
      wx.setStorageSync('isLoggedIn', true);
      wx.switchTab({
        url: '/pages/home/home'
      });
    } else {
      // 验证失败
      wx.showToast({
        title: '验证码错误',
        icon: 'none'
      });
    }
  },
  onLogin: function() {
    // 模拟登录成功
    const userInfo = {
      username: 'testuser',
      avatar: 'https://example.com/default-avatar.png'
    };

    // 存储用户信息
    wx.setStorageSync('userInfo', userInfo);

    // 更新页面数据
    this.setData(userInfo);

    // 跳转到个人界面
    wx.switchTab({
      url: '/pages/contact/contact'
    });
  }
});
