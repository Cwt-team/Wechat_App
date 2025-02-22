const API_CONFIG = {
  BASE_URL: 'http://******',
  UDP_HOST: 'www.xxx.com',
  UDP_PORT: 7998,
  ENDPOINTS: {
    CHECK_PASSWORD: '/oneLock',
    UNLOCK_CALLBACK: '/unlockCallback',
    UPLOAD_IMAGE: '/addUpload',
    UPDATE_IMAGE: '/updateImage',
    AUTH_IMAGE: '/authImage'
  }
};

class HardwareService {
  constructor() {
    this.deviceInfo = {
      communityId: '',
      deviceCode: '',
      unitId: '',
      roomNumber: ''
    };
  }

  // 初始化设备信息
  initDevice(deviceInfo) {
    this.deviceInfo = { ...deviceInfo };
  }

  // 心跳包相关
  createHeartbeatMessage() {
    return {
      ...this.deviceInfo,
      cmd: 'heart',
      softVer: '1.02.03.04',
      name: '明珠花园',
      deviceSn: 'asjkdfioussdj123'
    };
  }

  // UDP通信
  sendUDPMessage(message) {
    return new Promise((resolve, reject) => {
      const udp = wx.createUDPSocket();
      udp.bind();
      
      udp.onMessage((res) => {
        const response = JSON.parse(res.message);
        if (response.result === '0') {
          resolve(response);
        } else {
          reject(new Error(response.message || '通信失败'));
        }
        udp.close();
      });

      udp.send({
        address: API_CONFIG.UDP_HOST,
        port: API_CONFIG.UDP_PORT,
        message: JSON.stringify(message)
      });
    });
  }

  // 发送心跳包
  async sendHeartbeat() {
    const message = this.createHeartbeatMessage();
    return this.sendUDPMessage(message);
  }

  // 密码校验
  async checkPassword(password) {
    return wx.request({
      url: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CHECK_PASSWORD,
      method: 'POST',
      data: {
        ...this.deviceInfo,
        onePassword: password
      }
    });
  }

  // 开锁记录上报
  async reportUnlock(params) {
    return wx.request({
      url: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.UNLOCK_CALLBACK,
      method: 'POST',
      data: {
        ...this.deviceInfo,
        ...params
      }
    });
  }

  // 上传开锁照片
  async uploadUnlockImage(filePath) {
    return wx.uploadFile({
      url: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.UPLOAD_IMAGE,
      filePath,
      name: 'file',
      formData: {
        'newName': `${Date.now()}.jpg`
      }
    });
  }

  // 更新人脸图片
  async updateFaceImage(state) {
    return wx.request({
      url: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.UPDATE_IMAGE,
      method: 'POST',
      data: {
        ...this.deviceInfo,
        timestrap: Date.now(),
        state
      }
    });
  }

  // 人脸检测
  async checkFace(params) {
    return wx.request({
      url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_IMAGE}`,
      method: 'POST',
      data: {
        ...this.deviceInfo,
        ...params
      }
    });
  }

  // 远程开锁
  async remoteUnlock(params) {
    const message = {
      ...this.deviceInfo,
      ...params,
      cmd: 'unlock',
      id: '1'
    };
    return this.sendUDPMessage(message);
  }

  // 权限检查
  async checkPermissions() {
    try {
      // 检查相机权限
      await wx.authorize({
        scope: 'scope.camera'
      });
      
      // 其他权限检查...
      
      return true;
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  }
}

module.exports = new HardwareService(); 