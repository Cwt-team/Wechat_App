Page({
    data: {
      visitorHistory: []
    },
    onLoad: function (options) {
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('transferVisitorHistory', (data) => {
        this.setData({
          visitorHistory: data.visitorHistory
        });
      });
    }
  });