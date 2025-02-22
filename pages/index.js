// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const udpUtil = require('../../utils/udp.js');
const deviceUtil = require('../../utils/device.js');
const imageUtil = require('../../utils/imageUtil.js');
const remoteControl = require('../../utils/remoteControl.js');
const hardwareService = require('../../utils/hardwareService.js');

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    deviceStatus: false,
    deviceInfo: {
      communityId: '123456',
      deviceCode: '200111',
      unitId: '0021',
      roomNumber: '0101'
    },
    unlockImage: '',
    unlockImageState: '10', // 10新建 20待验证 30删除 40无效图片 50有效图片
    faceCheckState: '10', // 10新建 20修改 30删除 40无效图片 50有效图片
    password: ''  // 添加密码字段
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  // 发送心跳包
  async sendHeartbeat() {
    try {
      const message = udpUtil.createHeartbeatMessage(
        '123456',  // 小区ID
        '200111'   // 设备编码
      );
      
      const response = await udpUtil.sendUDPMessage(message);
      this.setData({
        deviceStatus: true
      });
      wx.showToast({
        title: '设备连接成功',
        icon: 'success'
      });
    } catch (error) {
      this.setData({
        deviceStatus: false
      });
      wx.showToast({
        title: '设备连接失败',
        icon: 'error'
      });
    }
  },

  // 定时发送心跳包
  startHeartbeat() {
    // 每50秒发送一次心跳包
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 50000);
  },

  onLoad() {
    hardwareService.initDevice({
      communityId: '123456',
      deviceCode: '200111',
      unitId: '0021',
      roomNumber: '0101'
    });
    this.startHeartbeat();
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  onUnload() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  },

  // 密码校验
  async checkPassword(password) {
    try {
      const params = {
        ...this.data.deviceInfo,
        password: password
      };
      
      const result = await deviceUtil.checkDevicePassword(params);
      wx.showToast({
        title: '密码验证成功',
        icon: 'success'
      });
      
      // 验证成功后上报开锁记录
      this.reportUnlock('1', '0', result.phone);
      
    } catch (error) {
      wx.showToast({
        title: error.message || '密码验证失败',
        icon: 'error'
      });
    }
  },

  // 上报开锁记录
  async reportUnlock(type, result, phone = '') {
    try {
      const params = {
        ...this.data.deviceInfo,
        type: type,
        result: result,
        phone: phone
      };
      
      await deviceUtil.reportUnlockRecord(params);
    } catch (error) {
      console.error('开锁记录上报失败:', error);
    }
  },

  // 拍照或选择照片
  async chooseImage() {
    try {
      const hasPermission = await hardwareService.checkPermissions();
      if (!hasPermission) {
        wx.showToast({
          title: '请授权相机权限',
          icon: 'none'
        });
        return;
      }
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera', 'album']
      });
      
      const tempFilePath = res.tempFiles[0].tempFilePath;
      this.setData({ unlockImage: tempFilePath });
      
      // 上传照片
      await this.uploadImage(tempFilePath);
    } catch (error) {
      console.error('权限检查失败:', error);
    }
  },

  // 上传照片
  async uploadImage(filePath) {
    try {
      wx.showLoading({ title: '上传中...' });
      const result = await imageUtil.uploadUnlockImage(filePath);
      
      // 更新人脸图片状态
      await imageUtil.updateFaceImage({
        ...this.data.deviceInfo,
        state: this.data.unlockImageState
      });

      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '上传失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 人脸检测
  async checkFace() {
    const hasPermission = await hardwareService.checkPermissions();
    if (!hasPermission) {
      wx.showToast({
        title: '请授予相机权限',
        icon: 'none'
      });
      return;
    }
    try {
      const params = {
        state: this.data.faceCheckState,
        phone: this.data.userInfo.phone || '',
        iffile: '1',
        file: this.data.unlockImage
      };
      
      wx.showLoading({ title: '检测中...' });
      const result = await remoteControl.checkFaceImage(params);
      
      wx.showToast({
        title: '检测成功',
        icon: 'success'
      });
      
      // 检测成功后可以进行远程开锁
      if (result) {
        this.remoteUnlock();
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '检测失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 远程开锁
  async remoteUnlock() {
    if (!this.data.password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    try {
      wx.showLoading({ title: '开锁中...' });
      const result = await remoteControl.remoteUnlock(this.data.deviceInfo);
      
      wx.showToast({
        title: '开锁成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '开锁失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 添加密码输入处理方法
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 修改密码验证方法调用
  onCheckPassword() {
    if (!this.data.password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    this.checkPassword(this.data.password);
  }
})
