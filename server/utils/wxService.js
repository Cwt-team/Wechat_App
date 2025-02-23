const axios = require('axios');
const config = require('../config/config');

class WxService {
  // 获取微信openid和session_key
  static async code2Session(code) {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: config.weapp.appId,
      secret: config.weapp.appSecret,
      js_code: code,
      grant_type: 'authorization_code'
    };
    
    console.log('请求微信接口参数:', params);

    try {
      const response = await axios.get(url, { params });
      console.log('微信接口返回数据:', response.data);
      
      const { openid, session_key, unionid, errcode, errmsg } = response.data;
      
      if (errcode) {
        switch(errcode) {
          case 40029:
            throw new Error('登录凭证无效，请重新登录');
          case 45011:
            throw new Error('登录请求过于频繁，请稍后再试');
          case 40226:
            throw new Error('登录失败，请稍后重试');
          case -1:
            throw new Error('系统繁忙，请稍后重试');
          default:
            throw new Error(`微信登录失败: ${errmsg}`);
        }
      }

      if (!openid) {
        throw new Error('获取openid失败');
      }

      return {
        openid,
        session_key,
        unionid
      };
    } catch (error) {
      console.error('微信登录凭证校验失败:', error);
      throw error;
    }
  }
}

module.exports = WxService; 