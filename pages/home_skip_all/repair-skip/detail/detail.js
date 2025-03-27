const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    token: '',
    repairId: null,
    repairDetail: null,
    loading: true,
    // 状态转换表
    statusMap: {
      'pending': { text: '待处理', color: '#ff9900', desc: '您的报修请求已提交，等待物业处理中' },
      'assigned': { text: '已分配', color: '#3399ff', desc: '您的报修请求已分配给维修人员' },
      'processing': { text: '处理中', color: '#3399ff', desc: '维修人员正在处理您的报修' },
      'completed': { text: '已完成', color: '#09bb07', desc: '您的报修请求已处理完成' },
      'cancelled': { text: '已取消', color: '#999999', desc: '您的报修请求已取消' },
      'rejected': { text: '已驳回', color: '#ff0000', desc: '您的报修请求被驳回，详情请查看处理说明' }
    },
    processNodes: [
      { status: 'pending', name: '提交报修' },
      { status: 'assigned', name: '分配人员' },
      { status: 'processing', name: '开始处理' },
      { status: 'completed', name: '处理完成' }
    ],
    // 报修类型映射
    typeMap: {
      'water_electric': '水电维修',
      'decoration': '装修维修',
      'furniture': '家具维修',
      'public_facility': '公共设施',
      'clean': '保洁服务',
      'security': '安保服务',
      'other': '其他'
    },
    currentStep: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const id = options.id || '';
    if (id) {
      this.fetchRepairDetail(id);
    } else {
      wx.showToast({
        title: '缺少报修单ID',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 获取报修详情
   */
  fetchRepairDetail(id) {
    const baseUrl = app.globalData.baseUrl || 'http://localhost:3000';
    const token = wx.getStorageSync('token');
    
    console.log('获取报修详情, ID:', id);
    wx.showLoading({ title: '加载中' });
    
    wx.request({
      url: `${baseUrl}/api/maintenance/detail?id=${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        console.log('报修详情数据:', res);
        wx.hideLoading();
        
        // 添加调试日志，查看返回的数据结构
        console.log('请求状态码:', res.statusCode);
        console.log('返回数据:', JSON.stringify(res.data));
        
        if (res.statusCode === 200 && res.data.code === 200) {
          // 数据处理
          const detail = res.data.data;
          
          // 将 JSON 字符串转换为数组对象
          let images = [];
          try {
            if (detail.images && detail.images !== '[]') {
              images = JSON.parse(detail.images);
            }
          } catch (error) {
            console.error('解析图片JSON错误:', error);
          }
          
          // 格式化时间
          const formattedDetail = {
            ...detail,
            images: images,
            report_time_formatted: this.formatDateTime(detail.report_time),
            expected_time_formatted: detail.expected_time ? this.formatDateTime(detail.expected_time) : '未指定',
            assign_time_formatted: detail.assign_time ? this.formatDateTime(detail.assign_time) : '',
            process_time_formatted: detail.process_time ? this.formatDateTime(detail.process_time) : '',
            complete_time_formatted: detail.complete_time ? this.formatDateTime(detail.complete_time) : '',
            status_text: this.getStatusText(detail.status),
            type_text: this.getTypeText(detail.type),
          };
          
          this.setData({
            repairDetail: formattedDetail,
            loading: false,
            dataLoaded: true
          });
        } else {
          wx.hideLoading();
          this.setData({
            loading: false,
            error: true,
            errorMsg: res.data.message || '获取报修详情失败'
          });
          
          wx.showToast({
            title: '获取报修详情失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取报修详情请求失败:', err);
        wx.hideLoading();
        this.setData({
          loading: false,
          error: true,
          errorMsg: '网络错误，请重试'
        });
        
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 生成查询码
   */
  generateQueryCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  },

  /**
   * 格式化日期时间
   */
  formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    const statusMap = {
      'pending': '待处理',
      'assigned': '已分配',
      'processing': '处理中',
      'completed': '已完成',
      'cancelled': '已取消',
      'rejected': '已驳回'
    };
    return statusMap[status] || status;
  },

  /**
   * 获取报修类型文本
   */
  getTypeText(type) {
    const typeMap = {
      'water_electric': '水电维修',
      'decoration': '装修维修',
      'public_facility': '公共设施',
      'clean': '保洁服务',
      'security': '安保服务',
      'other': '其他'
    };
    return typeMap[type] || type;
  },

  /**
   * 联系物业
   */
  callProperty() {
    wx.makePhoneCall({
      phoneNumber: this.data.repairDetail.property_phone || '400-888-8888',
      fail: function(err) {
        console.error('拨打电话失败:', err);
      }
    });
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    const urls = this.data.repairDetail.imageList;
    wx.previewImage({
      current,
      urls
    });
  },

  /**
   * 取消报修
   */
  cancelRepair() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此次报修吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' });
          
          wx.request({
            url: `${app.globalData.apiBaseUrl}/api/repair/cancel/${this.data.repairId}`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${this.data.token}`
            },
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success'
                });
                
                // 重新获取详情
                setTimeout(() => {
                  this.fetchRepairDetail();
                }, 1500);
              } else {
                wx.showToast({
                  title: res.data.message || '操作失败',
                  icon: 'none'
                });
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              });
            },
            complete: () => {
              wx.hideLoading();
            }
          });
        }
      }
    });
  },

  /**
   * 前往评价页面
   */
  navigateToEvaluate() {
    wx.navigateTo({
      url: `/pages/home_skip_all/repair-skip/evaluate/evaluate?id=${this.data.repairId}`
    });
  },
  
  /**
   * 查看评价
   */
  viewEvaluation() {
    wx.navigateTo({
      url: `/pages/home_skip_all/repair-skip/evaluation/evaluation?id=${this.data.repairId}`
    });
  },
  
  /**
   * 再次报修
   */
  repairAgain() {
    if (this.data.repairDetail.repair_type === 'public_facility') {
      wx.navigateTo({
        url: '/pages/home_skip_all/repair-skip/public/public'
      });
    } else {
      wx.navigateTo({
        url: '/pages/home_skip_all/repair-skip/personage/personage'
      });
    }
  }
}) 