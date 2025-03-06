Page({
    data: {
      visitDate: '请选择日期',
      visitTime: '请选择时间',
      visitorName: '',
      visitorCode: '',
      visitorHistory: [] // 新增数组用于存储访客码生成记录
    },
  
    onVisitDateChange: function (e) {
      this.setData({
        visitDate: e.detail.value
      });
    },
  
    onVisitTimeChange: function (e) {
      this.setData({
        visitTime: e.detail.value
      });
    },
  
    onVisitorNameInput: function (e) {
      this.setData({
        visitorName: e.detail.value
      });
    },
  
    generateVisitorCode: function () {
      const { visitDate, visitTime, visitorName } = this.data;
  
      if (visitDate === '请选择日期' || visitTime === '请选择时间' || !visitorName) {
        wx.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
  
      // 生成四位数的访客码
      const code = Math.floor(1000 + Math.random() * 9000);
      this.setData({
        visitorCode: code
      });
  
      // 记录访客码生成历史
      const newRecord = {
        date: visitDate,
        time: visitTime,
        name: visitorName,
        code: code
      };
      this.setData({
        visitorHistory: [...this.data.visitorHistory, newRecord]
      });
  
      wx.showToast({
        title: '访客码已生成',
        icon: 'success'
      });
  
      console.log('访客码生成记录:', this.data.visitorHistory);
    },
    navigateToHistory: function () {
        wx.navigateTo({
          url: '/pages/home_skip_all/fk-invite/visitorHistory/visitorHistory',
          success: (res) => {
            res.eventChannel.emit('transferVisitorHistory', {
              visitorHistory: this.data.visitorHistory
            });
          }
        });
      }
  });