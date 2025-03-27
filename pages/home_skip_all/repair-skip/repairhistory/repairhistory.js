const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    token: '',
    maintenanceList: [],
    loading: true,
    empty: false,
    // 状态转换表
    statusMap: {
      'pending': { text: '待处理', color: '#ff9900' },
      'assigned': { text: '已分配', color: '#3399ff' },
      'processing': { text: '处理中', color: '#3399ff' },
      'completed': { text: '已完成', color: '#09bb07' },
      'cancelled': { text: '已取消', color: '#999999' },
      'rejected': { text: '已驳回', color: '#ff0000' }
    },
    // 报修类型转换表
    typeMap: {
      'water_electric': '水电维修',
      'decoration': '装修维修',
      'furniture': '家具维修',
      'public_facility': '公共设施',
      'clean': '保洁服务',
      'security': '安保服务',
      'other': '其他'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const token = wx.getStorageSync('token');
    this.setData({ token });
    this.fetchMaintenanceHistory();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.fetchMaintenanceHistory(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 获取报修历史记录
   */
  fetchMaintenanceHistory(callback) {
    this.setData({ loading: true });
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';
    
    wx.request({
      url: `${baseUrl}/api/maintenance/history`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${this.data.token}`
      },
      success: (res) => {
        console.log('获取报修历史结果:', res.data);
        
        if (res.data.code === 200) {
          // 处理报修数据，添加格式化日期和状态文本
          const list = res.data.data.map(item => {
            // 格式化报修时间
            const reportTime = new Date(item.report_time);
            item.formatted_time = `${reportTime.getFullYear()}-${String(reportTime.getMonth() + 1).padStart(2, '0')}-${String(reportTime.getDate()).padStart(2, '0')}`;
            
            // 添加状态文本和颜色
            const status = this.data.statusMap[item.status] || { text: item.status, color: '#999999' };
            item.status_text = status.text;
            item.status_color = status.color;

            // 添加报修类型文本
            item.type_text = this.data.typeMap[item.type] || item.type;
            
            return item;
          });
          
          this.setData({ 
            maintenanceList: list,
            empty: list.length === 0
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取历史记录失败',
            icon: 'none'
          });
          this.setData({ empty: true });
        }
      },
      fail: (err) => {
        console.error('获取报修历史记录失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        this.setData({ empty: true });
      },
      complete: () => {
        this.setData({ loading: false });
        if (callback) callback();
      }
    });
  },

  /**
   * 查看报修详情
   */
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/home_skip_all/repair-skip/detail/detail?id=${id}`
    });
  },

  /**
   * 取消报修
   */
  cancelRepair(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消此报修吗？',
      success: (res) => {
        if (res.confirm) {
          this.doCancel(id);
        }
      }
    });
  },

  /**
   * 执行取消操作
   */
  doCancel(id) {
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';
    
    wx.showLoading({ title: '取消中' });
    
    wx.request({
      url: `${baseUrl}/api/maintenance/cancel/${id}`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${this.data.token}`
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.data.code === 200) {
          wx.showToast({
            title: '报修已取消',
            icon: 'success'
          });
          // 重新获取历史记录
          setTimeout(() => {
            this.fetchMaintenanceHistory();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '取消失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('取消报修失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  }
}) 