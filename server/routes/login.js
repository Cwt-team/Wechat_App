const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const smsService = require('../utils/smsService');
const WxService = require('../utils/wxService');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 手机号登录
router.post('/phone', async (req, res) => {
  const { phoneNumber, verificationCode } = req.body;
  
  try {
    // 验证验证码
    if (!await verifyCode(req, phoneNumber, verificationCode)) {
      return res.json({ code: 400, message: '验证码错误或已过期' });
    }

    const connection = await pool.getConnection();
    
    try {
      // 查询业主信息
      const [owners] = await connection.execute(
        `SELECT oi.*, op.*, hi.house_full_name, ci.community_name 
         FROM owner_info oi
         LEFT JOIN owner_permission op ON oi.id = op.owner_id
         LEFT JOIN house_info hi ON oi.house_id = hi.id
         LEFT JOIN community_info ci ON oi.community_id = ci.id
         WHERE oi.phone_number = ?`,
        [phoneNumber]
      );

      if (owners.length === 0) {
        return res.json({ code: 404, message: '该手机号未注册' });
      }

      const owner = owners[0];
      const token = generateToken(owner);

      // 清除验证码
      delete req.session.verifyCode;

      res.json({
        code: 200,
        message: '登录成功',
        data: formatUserData(owner, token)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('手机号登录错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 微信登录
router.post('/wechat', async (req, res) => {
  const { code, userInfo } = req.body;
  
  try {
    console.log('收到微信登录请求:', { code, userInfo });
    
    if (!code || !userInfo) {
      return res.json({
        code: 400,
        message: '参数不完整'
      });
    }

    // 获取微信openid
    const wxLoginRes = await WxService.code2Session(code);
    console.log('微信登录接口返回:', wxLoginRes);
    
    const { openid } = wxLoginRes;

    if (!openid) {
      return res.json({
        code: 500,
        message: '获取openid失败'
      });
    }

    const connection = await pool.getConnection();
    
    try {
      // 查询是否已有用户
      const [owners] = await connection.execute(
        'SELECT * FROM owner_info WHERE wx_openid = ?',
        [openid]
      );

      let owner;
      if (owners.length > 0) {
        // 已存在用户,直接返回
        owner = owners[0];
      } else {
        // 不存在则创建新用户
        const [result] = await connection.execute(
          'INSERT INTO owner_info (wx_openid, nickname, avatar_url, gender, country, province, city, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            openid, 
            userInfo.nickName,
            userInfo.avatarUrl,
            userInfo.gender,
            userInfo.country,
            userInfo.province,
            userInfo.city,
            userInfo.language
          ]
        );
        owner = {
          id: result.insertId,
          wx_openid: openid,
          nickname: userInfo.nickName,
          avatar_url: userInfo.avatarUrl,
          gender: userInfo.gender,
          country: userInfo.country,
          province: userInfo.province,
          city: userInfo.city,
          language: userInfo.language
        };
      }

      // 生成token
      const token = generateToken(owner);
      
      return res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          userInfo: owner
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('微信登录处理错误:', error);
    return res.json({
      code: 500, 
      message: error.message || '服务器错误'
    });
  }
});

// 辅助函数
function generateToken(owner) {
  return jwt.sign({
    id: owner.id,
    type: 'owner'
  }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
}

function formatUserData(owner, token) {
  return {
    token,
    userInfo: {
      id: owner.id,
      name: owner.name,
      phoneNumber: owner.phone_number,
      communityId: owner.community_id,
      communityName: owner.community_name,
      houseFullName: owner.house_full_name,
      permissions: {
        callingEnabled: owner.calling_enabled,
        pstnEnabled: owner.pstn_enabled
      }
    }
  };
}

async function verifyCode(req, phoneNumber, code) {
  const sessionVerifyCode = req.session.verifyCode;
  return sessionVerifyCode && 
         sessionVerifyCode.phoneNumber === phoneNumber && 
         sessionVerifyCode.code === code &&
         Date.now() <= sessionVerifyCode.expireTime;
}

// 绑定手机号
router.post('/bind-phone', async (req, res) => {
  const { code, wxCode, userInfo } = req.body;
  
  try {
    console.log('收到绑定手机号请求:', { code, wxCode, userInfo });

    // 1. 获取access_token
    const tokenRes = await getAccessToken();
    
    // 2. 调用微信接口获取手机号
    const phoneRes = await axios.post(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${tokenRes.access_token}`,
      { code }
    );

    if (phoneRes.data.errcode === 0) {
      const phoneNumber = phoneRes.data.phone_info.phoneNumber;
      console.log('获取手机号成功:', phoneNumber);

      const connection = await pool.getConnection();
      
      try {
        // 3. 查询手机号是否已存在
        const [owners] = await connection.execute(
          'SELECT * FROM owner_info WHERE phone_number = ?',
          [phoneNumber]
        );

        let owner;
        if (owners.length > 0) {
          // 4a. 已存在则更新openid
          owner = owners[0];
          await connection.execute(
            'UPDATE owner_info SET wx_openid = ? WHERE id = ?',
            [userInfo.openid, owner.id]
          );
          console.log('更新已有业主微信信息:', owner.id);
        } else {
          // 4b. 不存在则创建新业主
          const [result] = await connection.execute(
            'INSERT INTO owner_info (phone_number, wx_openid, nickname, avatar_url) VALUES (?, ?, ?, ?)',
            [phoneNumber, userInfo.openid, userInfo.nickName, userInfo.avatarUrl]
          );
          owner = {
            id: result.insertId,
            phone_number: phoneNumber,
            nickname: userInfo.nickName
          };
          console.log('创建新业主:', owner.id);
        }

        // 5. 生成token
        const token = generateToken(owner);
        
        res.json({
          code: 200,
          message: '绑定成功',
          data: {
            token,
            userInfo: owner
          }
        });
      } finally {
        connection.release();
      }
    } else {
      console.error('获取手机号失败:', phoneRes.data);
      throw new Error('获取手机号失败');
    }
  } catch (error) {
    console.error('绑定手机号错误:', error);
    res.json({
      code: 500,
      message: error.message || '服务器错误'
    });
  }
});

// 发送验证码
router.post('/verify-code', async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 发送验证码
    await smsService.sendVerifyCode(phoneNumber, code);
    
    // 将验证码存入Redis或Session(这里使用Session示例)
    req.session.verifyCode = {
      code,
      phoneNumber,
      expireTime: Date.now() + 5 * 60 * 1000 // 5分钟有效期
    };
    
    res.json({
      code: 200,
      message: '验证码发送成功'
    });
  } catch (error) {
    res.json({
      code: 500,
      message: '验证码发送失败'
    });
  }
});

// 添加 token 校验接口
router.get('/check', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.json({
      code: 401,
      message: '未登录'
    });
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 查询用户信息
    const connection = await pool.getConnection();
    try {
      const [owners] = await connection.execute(
        'SELECT * FROM owner_info WHERE id = ?',
        [decoded.id]
      );

      if (owners.length === 0) {
        return res.json({
          code: 401,
          message: '用户不存在'
        });
      }

      res.json({
        code: 200,
        message: 'token有效'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('token验证失败:', error);
    res.json({
      code: 401,
      message: 'token无效'
    });
  }
});

module.exports = router; 