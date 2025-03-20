Page({
    data: {
      repairOrder: {
        orderNumber: '',
        submitDate: '',
        building: '',
        roomNumber: '',
        category: '',
        contactName: '',
        phoneNumber: '',
        appointmentDate: '',
        appointmentTime: '',
        status: 'pending',
        description: ''
      },
      processSteps: [
        { title: '提交报修', description: '等待物业确认', status: 'finish' },
        { title: '物业受理', description: '物业人员处理中', status: 'process' },
        { title: '维修处理', description: '维修人员上门处理', status: 'wait' },
        { title: '完成维修', description: '维修工作已完成', status: 'wait' }
      ]
    },
  
    onLoad: function (options) {
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('acceptDataFromOpenerPage', (data) => {
        // 如果是从历史记录页面进入，直接使用传递的数据
        if (data.orderNumber) {
          this.setData({
            repairOrder: data
          });
        } else {
          // 如果是新提交的报修，生成新的报修单号
          const orderNumber = this.generateOrderNumber();
          this.setData({
            'repairOrder.orderNumber': orderNumber,
            'repairOrder.submitDate': this.formatDate(new Date()),
            'repairOrder.building': data.building,
            'repairOrder.roomNumber': data.roomNumber,
            'repairOrder.category': data.selectedCategory,
            'repairOrder.contactName': data.contactName,
            'repairOrder.phoneNumber': data.phoneNumber,
            'repairOrder.appointmentDate': data.appointmentDate,
            'repairOrder.appointmentTime': data.appointmentTime,
            'repairOrder.description': data.description
          });
          // 保存到本地存储
          this.saveRepairOrder();
        }
      });
    },
  
    generateOrderNumber() {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < 12; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    },
  
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  
    saveRepairOrder() {
      let repairHistory = wx.getStorageSync('repairHistory') || [];
      repairHistory.unshift(this.data.repairOrder);
      wx.setStorageSync('repairHistory', repairHistory);
    },
  
    viewHistory() {
      wx.navigateTo({
        url: './repairhistory/repairhistory'
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