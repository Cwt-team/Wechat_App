const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const jwt = require('jsonwebtoken');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 获取业主信息
router.get('/info', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({ code: 401, message: '未授权' });
    }

    // 验证token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret || 'your-secret-key');
    } catch (err) {
      return res.json({ code: 401, message: 'token无效' });
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
         WHERE oi.id = ?`,
        [decoded.id]
      );

      if (owners.length === 0) {
        return res.json({ code: 404, message: '业主不存在' });
      }

      const owner = owners[0];
      
      // 返回业主信息
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          id: owner.id,
          nickname: owner.nickname || owner.name || '业主',
          avatar_url: owner.avatar_url || '',
          phone_number: owner.phone_number || '',
          house_full_name: owner.house_full_name || '',
          community_name: owner.community_name || '',
          account: owner.account || ''
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取业主信息错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 更新业主信息
router.post('/update', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({ code: 401, message: '未授权' });
    }

    // 验证token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret || 'your-secret-key');
    } catch (err) {
      return res.json({ code: 401, message: 'token无效' });
    }

    const { nickname, avatar_url } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      // 更新业主信息
      await connection.execute(
        'UPDATE owner_info SET nickname = ?, avatar_url = ? WHERE id = ?',
        [nickname, avatar_url, decoded.id]
      );

      // 查询更新后的业主信息
      const [owners] = await connection.execute(
        `SELECT oi.*, op.*, hi.house_full_name, ci.community_name 
         FROM owner_info oi
         LEFT JOIN owner_permission op ON oi.id = op.owner_id
         LEFT JOIN house_info hi ON oi.house_id = hi.id
         LEFT JOIN community_info ci ON oi.community_id = ci.id
         WHERE oi.id = ?`,
        [decoded.id]
      );

      const owner = owners[0];
      
      // 返回更新后的业主信息
      res.json({
        code: 200,
        message: '更新成功',
        data: {
          id: owner.id,
          nickname: owner.nickname || owner.name || '业主',
          avatar_url: owner.avatar_url || '',
          phone_number: owner.phone_number || '',
          house_full_name: owner.house_full_name || '',
          community_name: owner.community_name || '',
          account: owner.account || ''
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新业主信息错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router; 