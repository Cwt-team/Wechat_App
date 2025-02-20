// pages/lock/lock.js
Page({

  /**
   * 页面的初始数据
   */
  data: {},
  onTabItemTap(item) {
    // 在这里处理 TabBar 的点击事件
    wx.showToast({
      title: 'TabBar 点击了：' + item.pagePath,
      icon: 'success',
      duration: 2000
    });
  }
})