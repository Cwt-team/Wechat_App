const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const smsService = require('../utils/smsService');
const WxService = require('../utils/wxService');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcrypt');

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
    
    if (!code) {
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

      if (owners.length > 0) {
        // 已存在用户,直接返回
        const owner = owners[0];
        console.log('找到现有用户:', owner);
        
        // 查询完整信息
        const [fullOwners] = await connection.execute(
          `SELECT oi.id, oi.*, op.*, hi.house_full_name, ci.community_name 
           FROM owner_info oi
           LEFT JOIN owner_permission op ON oi.id = op.owner_id
           LEFT JOIN house_info hi ON oi.house_id = hi.id
           LEFT JOIN community_info ci ON oi.community_id = ci.id
           WHERE oi.id = ?`,
          [owner.id]
        );
        
        const fullOwner = fullOwners[0];
        console.log('用户完整信息:', fullOwner);
        
        const token = generateToken(fullOwner);
        console.log('生成的token:', token);
        
        return res.json({
          code: 200,
          message: '登录成功',
          data: formatUserData(fullOwner, token)
        });
      } else {
        // 不存在则返回需要绑定账号的状态码
        return res.json({
          code: 201,
          message: '请绑定账号',
          data: {
            openid: openid
          }
        });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('微信登录错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 辅助函数
function generateToken(user) {
  // 打印用户信息，检查id是否存在
  console.log('生成token的用户信息:', user);
  
  return jwt.sign(
    { 
      id: user.id, // 确保这里正确设置了id
      openid: user.wx_openid 
    },
    config.jwt.secret || 'your-secret-key',
    { expiresIn: '7d' }
  );
}

function formatUserData(user, token) {
  return {
    token,
    userInfo: {
      id: user.id,
      nickname: user.nickname || user.name || '业主',
      avatar_url: user.avatar_url || '',
      phone_number: user.phone_number || '',
      house_full_name: user.house_full_name || '',
      community_name: user.community_name || '',
      account: user.account || ''
    }
  };
}

async function verifyCode(req, phone, code) {
  // 简化版验证，实际应用中应该更严格
  return req.session.verifyCode && 
         req.session.verifyCode.phone === phone && 
         req.session.verifyCode.code === code &&
         req.session.verifyCode.expireTime > Date.now();
}

// 绑定账号
router.post('/bind-account', async (req, res) => {
  const { openid, account, password, isNew } = req.body;
  
  if (!openid || !account || !password) {
    return res.json({ code: 400, message: '参数不完整' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    try {
      if (isNew) {
        // 创建新账号
        // 检查账号是否已存在
        const [existingAccounts] = await connection.execute(
          'SELECT * FROM owner_info WHERE account = ?',
          [account]
        );
        
        if (existingAccounts.length > 0) {
          return res.json({ code: 400, message: '账号已存在' });
        }
        
        // 创建新用户，直接使用明文密码
        const [result] = await connection.execute(
          'INSERT INTO owner_info (account, password, wx_openid, nickname) VALUES (?, ?, ?, ?)',
          [account, password, openid, '新用户']
        );
        
        const ownerId = result.insertId;
        
        // 查询新创建的用户信息
        const [owners] = await connection.execute(
          'SELECT * FROM owner_info WHERE id = ?',
          [ownerId]
        );
        
        const owner = owners[0];
        const token = generateToken(owner);
        
        return res.json({
          code: 200,
          message: '创建成功',
          data: {
            token: token,
            userInfo: {
              id: owner.id,
              account: owner.account,
              nickname: owner.nickname || '新用户',
              avatar_url: ''
            }
          }
        });
      } else {
        // 绑定已有账号
        // 查询账号是否存在
        const [owners] = await connection.execute(
          'SELECT * FROM owner_info WHERE account = ?',
          [account]
        );
        
        if (owners.length === 0) {
          return res.json({ code: 404, message: '账号不存在' });
        }
        
        const owner = owners[0];
        
        // 验证密码
        const isPasswordValid = password === owner.password;
        
        if (!isPasswordValid) {
          return res.json({ code: 401, message: '密码错误' });
        }
        
        // 更新openid
        await connection.execute(
          'UPDATE owner_info SET wx_openid = ? WHERE id = ?',
          [openid, owner.id]
        );
        
        // 查询完整信息
        const [fullOwners] = await connection.execute(
          `SELECT oi.id, oi.*, op.*, hi.house_full_name, ci.community_name 
           FROM owner_info oi
           LEFT JOIN owner_permission op ON oi.id = op.owner_id
           LEFT JOIN house_info hi ON oi.house_id = hi.id
           LEFT JOIN community_info ci ON oi.community_id = ci.id
           WHERE oi.id = ?`,
          [owner.id]
        );
        
        const fullOwner = fullOwners[0];
        const token = generateToken(fullOwner);
        
        return res.json({
          code: 200,
          message: '绑定成功',
          data: formatUserData(fullOwner, token)
        });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('绑定账号错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 检查登录状态
router.get('/check', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.json({ code: 401, message: '未登录' });
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret || 'your-secret-key');
    
    // 查询用户信息
    const connection = await pool.getConnection();
    
    try {
      const [owners] = await connection.execute(
        `SELECT oi.*, op.*, hi.house_full_name, ci.community_name 
         FROM owner_info oi
         LEFT JOIN owner_permission op ON oi.id = op.owner_id
         LEFT JOIN house_info hi ON oi.house_id = hi.id
         LEFT JOIN community_info ci ON oi.community_id = ci.id
         WHERE oi.id = ?`,
        [decoded.id]
      );
      
      if (owners.length === 0) {
        return res.json({ code: 404, message: '用户不存在' });
      }
      
      const owner = owners[0];
      
      res.json({
        code: 200,
        message: '已登录',
        data: {
          userInfo: {
            id: owner.id,
            nickname: owner.nickname || owner.name || '业主',
            avatar_url: owner.avatar_url || '',
            phone_number: owner.phone_number || '',
            house_full_name: owner.house_full_name || '',
            community_name: owner.community_name || '',
            account: owner.account || ''
          }
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('验证token错误:', error);
    res.json({ code: 401, message: '登录已过期' });
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

module.exports = router; 

// 账号密码登录
router.post('/account', async (req, res) => {
  const { account, password } = req.body;
  
  if (!account || !password) {
    return res.json({ code: 400, message: '账号和密码不能为空' });
  }
  
  try {
    const connection = await pool.getConnection();
    
    try {
      // 查询业主信息
      const [owners] = await connection.execute(
        `SELECT oi.*, op.*, hi.house_full_name, ci.community_name 
         FROM owner_info oi
         LEFT JOIN owner_permission op ON oi.id = op.owner_id
         LEFT JOIN house_info hi ON oi.house_id = hi.id
         LEFT JOIN community_info ci ON oi.community_id = ci.id
         WHERE oi.account = ?`,
        [account]
      );
      
      if (owners.length === 0) {
        return res.json({ code: 404, message: '账号不存在' });
      }
      
      const owner = owners[0];
      
      // 验证密码
      const isPasswordValid = password === owner.password;
      
      if (!isPasswordValid) {
        return res.json({ code: 401, message: '密码错误' });
      }
      
      // 生成token
      const token = generateToken(owner);
      
      res.json({
        code: 200,
        message: '登录成功',
        data: formatUserData(owner, token)
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('账号密码登录错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});