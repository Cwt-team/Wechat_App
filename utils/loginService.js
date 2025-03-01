const API_CONFIG = require('./config.js');
const request = require('./request');

class LoginService {
  // 手机号登录
  static async phoneLogin(phoneNumber, verificationCode) {
    console.log('开始手机号登录请求, 参数:', { phoneNumber, verificationCode });

    try {
      const res = await request.send({
        url: API_CONFIG.ENDPOINTS.LOGIN.PHONE,
        method: 'POST',
        data: { 
          phoneNumber,
          verificationCode 
        }
      });

      console.log('手机号登录响应原始数据:', res);

      if (!res.statusCode) {
        console.error('请求失败,未获取到状态码');
        throw new Error('网络请求失败');
      }

      if (res.statusCode !== 200) {
        console.error('请求状态码异常:', res.statusCode);
        throw new Error('服务器响应异常');
      }

      if (!res.data) {
        console.error('服务器返回数据为空');
        throw new Error('服务器未返回数据');
      }

      console.log('手机号登录响应处理后数据:', res.data);
      return res.data;

    } catch (error) {
      console.error('手机号登录请求异常:', error);
      throw error;
    }
  }

  // 发送验证码
  static async sendVerifyCode(phoneNumber) {
    console.log('开始发送验证码请求, 手机号:', phoneNumber);

    try {
      const res = await request.send({
        url: API_CONFIG.ENDPOINTS.LOGIN.VERIFY_CODE,
        method: 'POST',
        data: { phoneNumber }
      });

      console.log('发送验证码响应原始数据:', res);

      if (!res.statusCode) {
        console.error('请求失败,未获取到状态码');
        throw new Error('网络请求失败');
      }

      if (res.statusCode !== 200) {
        console.error('请求状态码异常:', res.statusCode);
        throw new Error('服务器响应异常');
      }

      if (!res.data) {
        console.error('服务器返回数据为空');
        throw new Error('服务器未返回数据');
      }

      console.log('发送验证码响应处理后数据:', res.data);
      return res.data;

    } catch (error) {
      console.error('发送验证码请求异常:', error);
      throw error;
    }
  }

  // 微信登录
  static async wechatLogin(code, userInfo) {
    console.log('开始微信登录请求, 参数:', { code, userInfo });
    
    if (!code) {
      console.error('登录凭证为空');
      throw new Error('登录凭证不能为空');
    }

    try {
      const res = await request.send({
        url: API_CONFIG.ENDPOINTS.LOGIN.WECHAT,
        method: 'POST',
        data: {
          code,
          userInfo
        }
      });

      console.log('微信登录响应原始数据:', res);

      if (!res.statusCode) {
        console.error('请求失败,未获取到状态码');
        throw new Error('网络请求失败');
      }

      if (res.statusCode !== 200) {
        console.error('请求状态码异常:', res.statusCode);
        throw new Error('服务器响应异常');
      }

      if (!res.data) {
        console.error('服务器返回数据为空');
        throw new Error('服务器未返回数据');
      }

      console.log('微信登录响应处理后数据:', res.data);
      return res.data;

    } catch (error) {
      console.error('微信登录请求异常:', error);
      throw error;
    }
  }

  // 绑定手机号
  static async bindPhone(data) {
    console.log('开始绑定手机号请求, 参数:', data);

    try {
      const res = await request.send({
        url: API_CONFIG.ENDPOINTS.LOGIN.BIND_PHONE,
        method: 'POST',
        data: data
      });

      console.log('绑定手机号响应:', res);

      if (!res.statusCode) {
        throw new Error('网络请求失败');
      }

      if (res.statusCode !== 200) {
        throw new Error('服务器响应异常');
      }

      return res.data;
    } catch (error) {
      console.error('绑定手机号请求异常:', error);
      throw error;
    }
  }

  // 添加手机号绑定方法
  async bindPhoneNumber(data) {
    try {
      const res = await wx.request({
        url: `${API_CONFIG.BASE_URL}/api/login/bind-phone`,
        method: 'POST',
        data: data
      });
      return res.data;
    } catch (error) {
      throw new Error('绑定手机号失败');
    }
  }
}

module.exports = LoginService; 