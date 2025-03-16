const app = getApp()

Page({
  data: {
    notices: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoggedIn: false,
    baseUrl: ''
  },

  onLoad() {
    console.log('社区通知页面加载')
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000'
    this.setData({
      baseUrl: baseUrl
    })
    this.checkLoginStatus()
  },
  
  onShow() {
    if (this.data.isLoggedIn) {
      this.loadNotices(true)
    }
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (token && userInfo) {
      this.setData({
        isLoggedIn: true
      })
      this.loadNotices(true)
    } else {
      this.setData({
        isLoggedIn: false
      })
    }
  },
  
  // 导航到登录页面
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.isLoggedIn) {
      this.setData({
        page: 1,
        notices: []
      })
      this.loadNotices(true, () => {
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
    }
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading && this.data.isLoggedIn) {
      this.loadNotices()
    }
  },

  async loadNotices(isRefresh = false, callback) {
    if (this.data.loading) return
    console.log('开始加载通知数据')
    
    this.setData({ loading: true })
    
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        console.log('未找到token,需要登录')
        this.setData({
          isLoggedIn: false,
          loading: false
        })
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
        this.setData({ loading: false })
        return
      }

      const page = isRefresh ? 1 : this.data.page
      
      console.log('发起请求获取通知列表')
      wx.request({
        url: `${this.data.baseUrl}/api/notices/list`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          page: page,
          pageSize: this.data.pageSize
        },
        // 使用箭头函数保持this指向
        success: (res) => {
          console.log('获取通知列表响应:', res.data)

          if (res.data && res.data.code === 200) {
            const newNotices = res.data.data.list.map(notice => ({
              id: notice.id,
              title: notice.title,
              content: notice.content,
              time: notice.formatted_create_time
            }))

            this.setData({
              notices: isRefresh ? newNotices : [...this.data.notices, ...newNotices],
              hasMore: newNotices.length === this.data.pageSize && (page * this.data.pageSize < res.data.data.pagination.total),
              loading: false,
              page: isRefresh ? 2 : this.data.page + 1
            })
          } else {
            console.error('获取通知列表失败:', res.data ? res.data.message : '未知错误')
            wx.showToast({
              title: res.data ? res.data.message || '获取通知失败' : '网络错误',
              icon: 'none'
            })
            this.setData({ loading: false })
          }
          
          if (typeof callback === 'function') {
            callback()
          }
        },
        // 使用箭头函数保持this指向
        fail: (error) => {
          console.error('获取通知列表异常:', error)
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          this.setData({ loading: false })
          
          if (typeof callback === 'function') {
            callback()
          }
        },
        complete: () => {
          this.setData({ loading: false })
          if (typeof callback === 'function') {
            callback()
          }
        }
      })
    } catch (error) {
      console.error('获取通知列表异常:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      this.setData({ loading: false })
      
      if (typeof callback === 'function') {
        callback()
      }
    }
  }
})
