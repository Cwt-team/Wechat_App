Page({
    navigateToPage(e) {
      const url = e.currentTarget.dataset.url; // 获取 data-url 的值
      wx.navigateTo({
        url: url // 跳转到指定页面
      });
    }
  });