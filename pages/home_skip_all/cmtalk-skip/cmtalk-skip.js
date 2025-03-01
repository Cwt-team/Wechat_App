Page({
    data: {
      notices: [
        {
          title: "杀虫",
          content: "请住户关好门窗",
          time: "2024-08-03 16:38"
        },
        {
          title: "紧急通知",
          content: "水管爆裂",
          time: "2024-08-03 16:37"
        }
        // 可添加更多通知...
      ],
      onNoticeClick(e) {
        const index = e.currentTarget.dataset.index;
        const notice = this.data.notices[index];
        wx.navigateTo({
          url: `/pages/notice-detail/index?id=${notice.id}` // 假设有唯一ID
        });
      }
    }  
  });