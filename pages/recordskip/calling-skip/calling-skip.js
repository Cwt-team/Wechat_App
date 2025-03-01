// pages/recordskip/calling-skip/calling-skip.js
import { getCallRecords } from '../../../utils/api';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    callRecords: [],
    loading: false,
    userInfo: null,
    isLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkLoginStatus();
    if (this.data.isLogin) {
      this.fetchCallRecords();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    if (this.data.isLogin) {
      this.fetchCallRecords();
    }
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    this.setData({
      userInfo: userInfo,
      isLogin: !!(userInfo && token)
    });
    
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
    }
  },
  
  fetchCallRecords: function() {
    this.setData({ loading: true });
    
    getCallRecords()
      .then(records => {
        // 格式化日期和时间
        const formattedRecords = records.map(record => {
          return {
            ...record,
            formattedTime: this.formatDateTime(record.call_start_time),
            formattedDuration: this.formatDuration(record.call_duration)
          };
        });
        
        this.setData({
          callRecords: formattedRecords,
          loading: false
        });
      })
      .catch(error => {
        console.error('获取呼叫记录失败:', error);
        wx.showToast({
          title: error.message || '获取呼叫记录失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
  },
  
  formatDateTime: function(dateTimeStr) {
    const date = new Date(dateTimeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },
  
  formatDuration: function(seconds) {
    if (!seconds) return '0秒';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}秒`;
    } else {
      return `${minutes}分${remainingSeconds}秒`;
    }
  },

  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
})