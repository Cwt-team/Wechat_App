const app = getApp()

Page({
  data: {
    notices: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    console.log('社区通知页面加载')
    this.loadNotices()
  },

  onPullDownRefresh() {
    console.log('下拉刷新')
    this.setData({
      page: 1,
      notices: [],
      hasMore: true
    })
    this.loadNotices(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadNotices()
    }
  },

  async loadNotices(callback) {
    if (this.data.loading) return
    console.log('开始加载通知数据')
    
    this.setData({ loading: true })
    
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        console.log('未找到token,需要登录')
        wx.navigateTo({ url: '/pages/login/login' })
        return
      }

      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo || !userInfo.community_name) {
        console.log('未找到用户社区信息')
        wx.showToast({
          title: '获取社区信息失败',
          icon: 'none'
        })
        return
      }

      console.log('发起请求获取通知列表')
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/api/notices/list`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })

      console.log('获取通知列表响应:', res.data)

      if (res.data.code === 200) {
        const newNotices = res.data.data.list.map(notice => ({
          id: notice.id,
          title: notice.title,
          content: notice.content,
          time: notice.formatted_create_time
        }))

        this.setData({
          notices: this.data.page === 1 ? newNotices : [...this.data.notices, ...newNotices],
          hasMore: newNotices.length === this.data.pageSize
        })
      } else {
        console.error('获取通知列表失败:', res.data.message)
        wx.showToast({
          title: res.data.message || '获取通知失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取通知列表异常:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
      callback && callback()
    }
  },

  onNoticeClick(e) {
    const index = e.currentTarget.dataset.index
    const notice = this.data.notices[index]
    console.log('点击通知:', notice)
    
    wx.navigateTo({
      url: `/pages/notice-detail/index?id=${notice.id}`
    })
  }
})