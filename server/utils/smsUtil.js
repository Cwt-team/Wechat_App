const Core = require('@alicloud/pop-core');
const config = require('../config/config');

// 创建阿里云客户端
const client = new Core({
    accessKeyId: config.aliyun.accessKeyId,
    accessKeySecret: config.aliyun.accessKeySecret,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});

/**
 * 发送短信验证码
 * @param {string} phoneNumber - 手机号码
 * @param {string} code - 验证码
 * @returns {Promise} - 发送结果
 */
async function sendSmsCode(phoneNumber, code) {
    const params = {
        PhoneNumbers: phoneNumber,
        SignName: config.aliyun.sms.signName,
        TemplateCode: config.aliyun.sms.templateCode,
        TemplateParam: JSON.stringify({ code })
    };

    const requestOption = {
        method: 'POST'
    };

    try {
        const result = await client.request('SendSms', params, requestOption);
        console.log('短信发送结果:', result);
        return result;
    } catch (error) {
        console.error('短信发送失败:', error);
        throw error;
    }
}

module.exports = {
    sendSmsCode
}; 