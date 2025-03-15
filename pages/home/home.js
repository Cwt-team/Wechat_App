// pages/home/home.js
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    customGridItems: [], // 用户自定义的功能列表
    defaultGridItems: [
      { icon: '/images/button/fangke-green.png', url: '/pages/home_skip_all/huhutong-skip/huhutong-skip', text: '户户通' },
      { icon: '/images/button/monitor-green.png', url: '', text: '监视' },
      { icon: '/images/button/invite-green.png', url: '/pages/home_skip_all/fk-invite/fk-invite', text: '访客邀请' },
      { icon: '/images/button/phone-green.png', url: '/pages/recordskip/calling-skip/calling-skip', text: '呼叫记录' },
      { icon: '/images/button/elevator-green.png', url: '', text: '呼叫电梯' },
      { icon: '/images/button/scan-green.png', url: '/pages/home_skip_all/calllog-skip/calllog-skip', text: '扫码开门' },
      { icon: '/images/button/message-green.png', url: '/pages/home_skip_all/cmtalk-skip/cmtalk-skip', text: '社区通知' }
    ]
  },
  
  onLoad: function() {
    this.loadCustomGridItems();
  },
  
  onShow: function() {
    // 每次页面显示时重新加载自定义项目，以便在用户从"更多"页面返回时更新
    this.loadCustomGridItems();
  },
  
  loadCustomGridItems: function() {
    const homeShownItems = wx.getStorageSync('homeShownItems');
    if (homeShownItems && homeShownItems.length > 0) {
      // 确保URL属性正确保留
      const items = homeShownItems.map(item => {
        // 如果是户户通，确保URL正确
        if (item.text === '户户通') {
          item.url = '/pages/home_skip_all/huhutong-skip/huhutong-skip';
        }
        // 如果是报事报修，确保URL正确
        if (item.text === '报事报修') {
          item.url = '/pages/home_skip_all/repair-skip/repair-skip';
        }
        return item;
      });
      this.setData({ customGridItems: items });
    } else {
      // 如果没有自定义设置，则使用默认设置
      this.setData({ customGridItems: this.data.defaultGridItems });
      
      // 同时保存默认设置到本地存储，以便"更多"页面可以正确显示选中状态
      wx.setStorageSync('homeShownItems', this.data.defaultGridItems);
    }
  },
  
  onClick() {
    Toast('这是一个提示');
  },
  
  // 网格项点击事件
  onGridItemTap: function(e) {
    const url = e.currentTarget.dataset.url;
    const text = e.currentTarget.dataset.text;
    
    console.log('点击了:', text, '跳转到:', url);
    
    // 1. 已实现的功能
    if (text === '户户通') {
      wx.navigateTo({
        url: '/pages/home_skip_all/huhutong-skip/huhutong-skip',
        fail: function(err) {
          console.error('户户通跳转失败:', err);
          wx.showToast({
            title: '户户通页面跳转失败',
            icon: 'none'
          });
        }
      });
      return;
    }

    if (text === '访客邀请') {
        wx.navigateTo({
          url: '/pages/home_skip_all/fk-invite/fk-invite',
          fail: function(err) {
            console.error('访客邀请跳转失败:', err);
            wx.showToast({
              title: '访客邀请页面跳转失败',
              icon: 'none'
            });
          }
        });
        return;
      }
    
    if (text === '报事报修') {
      wx.navigateTo({
        url: '/pages/home_skip_all/repair-skip/repair-skip',
        fail: function(err) {
          console.error('报事报修跳转失败:', err);
          wx.showToast({
            title: '报事报修页面跳转失败',
            icon: 'none'
          });
        }
      });
      return;
    }
    
    // 添加呼叫记录跳转
    if (text === '呼叫记录') {
      wx.navigateTo({
        url: '/pages/recordskip/calling-skip/calling-skip',
        fail: function(err) {
          console.error('呼叫记录跳转失败:', err);
          wx.showToast({
            title: '呼叫记录页面跳转失败',
            icon: 'none'
          });
        }
      });
      return;
    }
    
    // 2. 待实现的功能
    if ([ '社区通知', '社区评价', ].includes(text)) {
      wx.showToast({
        title: `${text}功能正在开发中`,
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 3. 暂时不用实现的功能
    if (['监视', '呼叫电梯', '一键反尾随'].includes(text)) {
      wx.showToast({
        title: `${text}功能需要硬件配合，敬请期待`,
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 其他未分类功能，有URL就跳转，没有就提示
    if (url) {
      wx.navigateTo({
        url: url,
        fail: function(err) {
          console.error('跳转失败:', err);
          wx.switchTab({
            url: url,
            fail: function(switchErr) {
              console.error('switchTab也失败:', switchErr);
              wx.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        }
      });
    } else {
      wx.showToast({
        title: `${text}功能即将上线`,
        icon: 'none'
      });
    }

    if (text === '扫码开门') {
      this.handleScanQRCode();
      return;
    }
  },
  
  // 服务卡片点击事件
  onServiceTap: function(e) {
    const serviceType = e.currentTarget.dataset.type;
    
    // 根据不同服务类型跳转到不同页面
    if (serviceType === 'travel') {
      wx.showToast({
        title: '旅游服务即将上线',
        icon: 'none',
        duration: 2000
      });
    } else if (serviceType === 'car') {
      wx.showToast({
        title: '车辆服务即将上线',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 扫码开门处理函数
  async handleScanQRCode() {
    try {
      const res = await wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode']
      });
      
      wx.showLoading({
        title: '验证中...'
      });

      const verifyResult = await deviceUtil.verifyQrCode({
        code: res.result
      });

      if(verifyResult.success) {
        await deviceUtil.unlockDoor();
        wx.showToast({
          title: '开门成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '无效的二维码',
          icon: 'error' 
        });
      }

    } catch (error) {
      console.error('扫码失败:', error);
      wx.showToast({
        title: error.message || '扫码失败',
        icon: 'none'
      });
      // 扫码失败返回上一页
      wx.navigateBack();
    } finally {
      wx.hideLoading();
    }
  }
});