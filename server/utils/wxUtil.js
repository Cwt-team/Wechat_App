const axios = require('axios');
const config = require('../config/config');

/**
 * 通过code获取微信openid和session_key
 * @param {string} code - 微信登录凭证
 * @returns {Promise} - 包含openid和session_key的Promise
 */
async function getWxSession(code) {
    try {
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wx.appid}&secret=${config.wx.secret}&js_code=${code}&grant_type=authorization_code`;

        const response = await axios.get(url);

        if (response.data.errcode) {
            throw new Error(`微信API错误: ${response.data.errmsg}`);
        }

        return {
            openid: response.data.openid,
            session_key: response.data.session_key
        };
    } catch (error) {
        console.error('获取微信session失败:', error);
        throw error;
    }
}

/**
 * 获取微信接口调用凭证access_token
 * @returns {Promise} - 包含access_token的Promise
 */
async function getAccessToken() {
    try {
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.wx.appid}&secret=${config.wx.secret}`;

        const response = await axios.get(url);

        if (response.data.errcode) {
            throw new Error(`微信API错误: ${response.data.errmsg}`);
        }

        return {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in
        };
    } catch (error) {
        console.error('获取微信access_token失败:', error);
        throw error;
    }
}

/**
 * 发送微信订阅消息
 * @param {string} openid - 用户openid
 * @param {string} templateId - 模板ID
 * @param {Object} data - 模板数据
 * @param {string} page - 跳转页面
 * @returns {Promise} - 发送结果
 */
async function sendSubscribeMessage(openid, templateId, data, page = 'pages/index/index') {
    try {
        const tokenResult = await getAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${tokenResult.access_token}`;

        const postData = {
            touser: openid,
            template_id: templateId,
            page,
            data
        };

        const response = await axios.post(url, postData);

        if (response.data.errcode !== 0) {
            throw new Error(`发送订阅消息失败: ${response.data.errmsg}`);
        }

        return response.data;
    } catch (error) {
        console.error('发送微信订阅消息失败:', error);
        throw error;
    }
}

module.exports = {
    getWxSession,
    getAccessToken,
    sendSubscribeMessage
}; 