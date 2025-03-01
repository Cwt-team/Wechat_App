Page({
  data: {
    buttons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'],
    dialedNumber: ''
  },
  onDial: function (e) {
    const number = e.currentTarget.dataset.value;
    this.setData({
      dialedNumber: this.data.dialedNumber + number
    });
  },
  onProperty: function () {
    wx.showToast({
      title: '联系物业',
      icon: 'none'
    });
  },
  onCall: function () {
    if (this.data.dialedNumber) {
      wx.makePhoneCall({
        phoneNumber: this.data.dialedNumber
      });
    } else {
      wx.showToast({
        title: '请输入号码',
        icon: 'none'
      });
    }
  },
  onDelete: function () {
    this.setData({
      dialedNumber: this.data.dialedNumber.slice(0, -1)
    });
  }
});

