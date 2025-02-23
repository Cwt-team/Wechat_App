// pages/auth/login/login.js
var util = require('../../../utils/util.js');
var user = require('../../../utils/user.js');
const app = getApp();
Page({
 
    /**
     * 页面的初始数据
     */
    data: {
        canIUseGetUserProfile: false, // 用于向前兼容
        lock:false
    },
    onLoad: function(options) {
        // 页面初始化 options为页面跳转所带来的参数
        // 页面渲染完成
        if (wx.getUserProfile) {
          this.setData({
            canIUseGetUserProfile: true
          })
        }
        //console.log('login.onLoad.canIUseGetUserProfile='+this.data.canIUseGetUserProfile)
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
 
    },
    getUserProfile(e) {
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                //console.log(res);
                debugger
                user.checkLogin().catch(() => {
                    user.loginByWeixin(res.userInfo).then(res => {
                      app.globalData.hasLogin = true;
                      debugger
                      wx.navigateBack({
                        delta: 1
                      })
                    }).catch((err) => {
                      app.globalData.hasLogin = false;
                      if(err.errMsg=="request:fail timeout"){
                        util.showErrorToast('微信登录超时');
                      }else{
                        util.showErrorToast('微信登录失败');
                      }
                      this.setData({
                        lock:false
                      })
                    });
                  });
            },
            fail: (res) => {
                app.globalData.hasLogin = false;
                console.log(res);
                util.showErrorToast('微信登录失败');
            }
        });
    },
    wxLogin: function(e) {
        if (e.detail.userInfo == undefined) {
          app.globalData.hasLogin = false;
          util.showErrorToast('微信登录失败');
          return;
        }
        user.checkLogin().catch(() => {
            user.loginByWeixin(e.detail.userInfo).then(res => {
              app.globalData.hasLogin = true;
              wx.navigateBack({
                delta: 1
              })
            }).catch((err) => {
              app.globalData.hasLogin = false;
              if(err.errMsg=="request:fail timeout"){
                util.showErrorToast('微信登录超时');
              }else{
                util.showErrorToast('微信登录失败');
              }
            });
      
          });
    },
    accountLogin() {
        console.log('开发中....')
    }
 
})