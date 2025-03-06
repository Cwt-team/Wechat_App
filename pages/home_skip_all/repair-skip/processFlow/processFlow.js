Page({
  onLoad: function (options) {
    // 假设我们通过navigateTo传递参数
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      console.log('预约时间:', data.appointmentDate, data.appointmentTime);
      // 可以在页面中显示预约时间
    });
  },
  confirmProcess: function () {
    // 模拟事件完成，返回报修界面
    wx.showToast({
      title: '事件已完成',
      icon: 'success'
    });
    // 返回到上一个页面
    wx.navigateBack();
  }
});