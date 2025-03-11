Page({
    data: {
      visitorHistory: [],
      statusMap: {
        0: '未使用',
        1: '已使用',
        2: '已过期/已取消'
      }
    },
    onLoad: function (options) {
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('transferVisitorHistory', (data) => {
        console.log('接收到访客历史数据:', data.visitorHistory);
        this.setData({
          visitorHistory: data.visitorHistory
        });
      });
    },
    // 取消访客邀请
    cancelInvitation: function(e) {
      const id = e.currentTarget.dataset.id;
      const token = wx.getStorageSync('token');
      
      wx.showModal({
        title: '确认取消',
        content: '确定要取消这个访客邀请吗？',
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '取消中...',
            });
            
            wx.request({
              url: `http://localhost:3000/api/visitor-invitation/${id}/cancel`,
              method: 'PUT',
              header: {
                'Authorization': 'Bearer ' + token
              },
              success: (res) => {
                wx.hideLoading();
                
                if (res.data.code === 200) {
                  wx.showToast({
                    title: '取消成功',
                    icon: 'success'
                  });
                  
                  // 更新本地数据状态
                  const updatedHistory = this.data.visitorHistory.map(item => {
                    if (item.id === id) {
                      return {...item, status: 2};
                    }
                    return item;
                  });
                  
                  this.setData({
                    visitorHistory: updatedHistory
                  });
                  
                  // 通知上一页面刷新数据
                  const pages = getCurrentPages();
                  const prevPage = pages[pages.length - 2];
                  if (prevPage) {
                    prevPage.getVisitorHistory();
                  }
                } else {
                  wx.showToast({
                    title: res.data.message || '取消失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                wx.hideLoading();
                console.error('请求失败:', err);
                wx.showToast({
                  title: '网络错误，请稍后重试',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    },
    // 格式化日期时间显示
    formatDateTime: function(date, time) {
      return `${date} ${time}`;
    }
  });