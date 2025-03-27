// // 验证二维码
// function verifyQrCode(params) {
//   return new Promise((resolve, reject) => {
//     wx.request({
//       url: API_CONFIG.BASE_URL + '/verifyQrCode',
//       method: 'POST',
//       data: params,
//       success: (res) => {
//         resolve(res.data);
//       },
//       fail: (error) => {
//         reject(error);
//       }
//     });
//   });
// }

// // 执行开门操作
// function unlockDoor(params) {
//   return new Promise((resolve, reject) => {
//     wx.request({
//       url: API_CONFIG.BASE_URL + '/unlockDoor',
//       method: 'POST',
//       data: params,
//       success: (res) => {
//         resolve(res.data);
//       },
//       fail: (error) => {
//         reject(error);
//       }
//     });
//   });
// }

// // 导出新增的方法
// module.exports = {
//   // 保留原有的导出
//   checkDevicePassword: checkDevicePassword,
//   reportUnlockRecord: reportUnlockRecord,
//   // 新增的方法
//   verifyQrCode: verifyQrCode,
//   unlockDoor: unlockDoor
// }; 