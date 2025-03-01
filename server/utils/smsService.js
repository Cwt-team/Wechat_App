const Core = require('@alicloud/pop-core');
const config = require('../config/config');

class SmsService {
  constructor() {
    this.client = new Core({
      accessKeyId: config.sms.accessKeyId,
      accessKeySecret: config.sms.accessKeySecret,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25'
    });
  }

  async sendVerifyCode(phoneNumber, code) {
    const params = {
      PhoneNumbers: phoneNumber,
      SignName: config.sms.signName,
      TemplateCode: config.sms.templateCode,
      TemplateParam: JSON.stringify({ code })
    };

    try {
      const result = await this.client.request('SendSms', params, { method: 'POST' });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SmsService(); 