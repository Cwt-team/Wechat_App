Page({
    data: {
      accessList: [
        { icon: '/images/button/fangke-green.png', text: '户户通', url: '/pages/home_skip_all/huhutong-skip/huhutong-skip', isShown: true, id: 'access1' },
        { icon: '/images/button/monitor-green.png', text: '监视', url: '', isShown: true, id: 'access2' },
        { icon: '/images/button/invite-green.png', text: '访客邀请', url: '/pages/home_skip_all/fk-invite/fk-invite', isShown: true, id: 'access3' },
        { icon: '/images/button/phone-green.png', text: '呼叫记录', url: '/pages/recordskip/calling-skip/calling-skip', isShown: true, id: 'access4' },
        { icon: '/images/button/elevator-green.png', text: '呼叫电梯', url: '', isShown: true, id: 'access5' },
        { icon: '/images/button/scan-green.png', text: '扫码开门', url: '/pages/home_skip_all/calllog-skip/calllog-skip', isShown: true, id: 'access6' },
        // 其他项...
      ],
      lifeList: [
        { icon: '/images/button/message-green.png', text: '社区通知', url: '/pages/home_skip_all/cmtalk-skip/cmtalk-skip', isShown: true, id: 'life1' },
        { icon: '/images/button/repair-green.png', text: '报事报修', url: '/pages/home_skip_all/repair-skip/repair-skip', isShown: false, id: 'life2' },
        { icon: '/images/button/message-green.png', text: '社区评价', url: '', isShown: false, id: 'life3' },
        { icon: '/images/button/complaint-green.png', text: '投诉建议', url: '/pages/home_skip_all/suggestion/suggestion', isShown: false, id: 'life4' },
        { icon: '/images/button/alarm-green.png', text: '报警记录', url: '', isShown: false, id: 'life5' },
        { icon: '/images/button/alarm-green.png', text: '一键火警', url: '/pages/home_skip_all/fire-skip/fire-skip', isShown: false, id: 'life6' },
        { icon: '/images/button/alarm-green.png', text: '一键反尾随', url: '', isShown: false, id: 'life7' },
      ],
      isManaging: false, // 是否处于管理模式
      homeShownItems: [], // 存储主页显示的项目
    },
    
    onLoad: function() {
      // 从本地存储加载用户自定义设置
      const homeShownItems = wx.getStorageSync('homeShownItems');
      if (homeShownItems && homeShownItems.length > 0) {
        // 更新 accessList 和 lifeList 中的 isShown 属性
        this.updateListsFromStorage(homeShownItems);
      } else {
        // 如果没有存储，则初始化 homeShownItems
        this.initHomeShownItems();
      }
    },

    // 初始化主页显示项目
    initHomeShownItems: function() {
      // 设置默认显示项目：智能门禁的全部和智慧生活的第一个
      let accessList = [...this.data.accessList];
      let lifeList = [...this.data.lifeList];
      
      // 确保智能门禁的全部项目都设置为显示
      accessList.forEach(item => {
        item.isShown = true;
      });
      
      // 确保智慧生活的第一个项目设置为显示，其余设置为不显示
      lifeList.forEach((item, index) => {
        item.isShown = (index === 0); // 只有第一个设为true
      });
      
      this.setData({
        accessList,
        lifeList
      });
      
      // 更新主页显示项目
      this.updateHomeShownItems();
    },
    
    // 从存储中更新列表
    updateListsFromStorage: function(homeShownItems) {
      let accessList = [...this.data.accessList];
      let lifeList = [...this.data.lifeList];
      
      // 重置所有项目的 isShown 为 false
      accessList.forEach(item => item.isShown = false);
      lifeList.forEach(item => item.isShown = false);
      
      // 根据 homeShownItems 更新 isShown 状态
      homeShownItems.forEach(shownItem => {
        // 检查 accessList
        let foundInAccess = accessList.findIndex(item => item.text === shownItem.text);
        if (foundInAccess !== -1) {
          accessList[foundInAccess].isShown = true;
        }
        
        // 检查 lifeList
        let foundInLife = lifeList.findIndex(item => item.text === shownItem.text);
        if (foundInLife !== -1) {
          lifeList[foundInLife].isShown = true;
        }
      });
      
      this.setData({
        accessList,
        lifeList,
        homeShownItems
      });
    },

    // 添加点击事件处理函数
    onItemTap: function(e) {
      const item = e.currentTarget.dataset.item;
      
      // 如果处于管理模式，则切换选中状态
      if (this.data.isManaging) {
        this.toggleItemSelection(item);
        return;
      }
      
      // 检查是否为开发中的功能
      if (item.text === '呼叫电梯' || item.text === '一键反尾随') {
        wx.showToast({
          title: '正在开发，敬请期待',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 如果有URL，则导航到对应页面
      if (item.url) {
        wx.navigateTo({
          url: item.url,
          fail: function(err) {
            console.error(`${item.text}跳转失败:`, err);
            wx.showToast({
              title: `${item.text}页面跳转失败`,
              icon: 'none'
            });
          }
        });
      } else if (['社区评价'].includes(item.text)) {
        wx.showToast({
          title: `${item.text}功能正在开发中`,
          icon: 'none',
          duration: 2000
        });
      }
    },
    
    // 切换管理模式
    toggleManageMode: function() {
      this.setData({
        isManaging: !this.data.isManaging
      });

      if (this.data.isManaging) {
        // 进入管理模式时，更新主页显示项目
        this.updateHomeShownItems();
      }
    },
    
    // 切换项目选中状态
    toggleItemSelection: function(item) {
      // 找出当前项目在哪个列表中
      let accessList = [...this.data.accessList];
      let lifeList = [...this.data.lifeList];
      let foundInAccess = accessList.findIndex(i => i.text === item.text);
      let foundInLife = lifeList.findIndex(i => i.text === item.text);
      
      // 计算当前已选中的项目数量
      const currentSelectedCount = accessList.filter(i => i.isShown).length + 
                                  lifeList.filter(i => i.isShown).length;
      
      // 如果项目当前未选中，且已选中数量已达到7个，则提示用户
      if (
        ((foundInAccess !== -1 && !accessList[foundInAccess].isShown) || 
         (foundInLife !== -1 && !lifeList[foundInLife].isShown)) && 
        currentSelectedCount >= 7
      ) {
        wx.showToast({
          title: '主页最多显示7个功能',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 更新项目状态
      if (foundInAccess !== -1) {
        accessList[foundInAccess].isShown = !accessList[foundInAccess].isShown;
        this.setData({ accessList });
      } else if (foundInLife !== -1) {
        lifeList[foundInLife].isShown = !lifeList[foundInLife].isShown;
        this.setData({ lifeList });
      }
      
      // 更新主页显示项目
      this.updateHomeShownItems();
    },
    
    // 更新主页显示项目
    updateHomeShownItems: function() {
      let homeShownItems = [];
      
      // 从 accessList 和 lifeList 中收集已标记为显示的项目
      this.data.accessList.forEach(item => {
        if (item.isShown) {
          homeShownItems.push({
            icon: item.icon,
            text: item.text,
            url: item.url,
            id: item.id
          });
        }
      });
      
      this.data.lifeList.forEach(item => {
        if (item.isShown) {
          homeShownItems.push({
            icon: item.icon,
            text: item.text,
            url: item.url,
            id: item.id
          });
        }
      });
      
      this.setData({ homeShownItems });
      
      // 保存到本地存储
      wx.setStorageSync('homeShownItems', homeShownItems);
    },
    
    // 保存设置并退出管理模式
    saveSettings: function() {
      // 更新主页显示项目
      this.updateHomeShownItems();
      
      // 退出管理模式
      this.setData({ isManaging: false });
      
      wx.showToast({
        title: '设置已保存',
        icon: 'success',
        duration: 1500
      });
    }
  });