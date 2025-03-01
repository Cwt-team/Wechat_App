// pages/home/home.js
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    customGridItems: [], // 用户自定义的功能列表
    defaultGridItems: [
      { icon: '/images/button/fangke-green.png', url: '/pages/home_skip_all/huhutong-skip/huhutong-skip', text: '户户通' },
      { icon: '/images/button/monitor-green.png', url: '', text: '监视' },
      { icon: '/images/button/invite-green.png', url: '', text: '访客邀请' },
      { icon: '/images/button/phone-green.png', url: '', text: '呼叫记录' },
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
      this.setData({ customGridItems: homeShownItems });
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
  }
});