const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 获取当前用户的访客邀请记录
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 打印完整的请求头信息，查看token是否正确传递
    console.log('请求头信息:', req.headers);
    
    // 尝试手动解析token
    const token = req.headers.authorization?.split(' ')[1];
    console.log('获取到的token:', token);
    
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret || 'your-secret-key');
        console.log('手动解析token结果:', decoded);
      } catch (err) {
        console.error('手动解析token失败:', err);
      }
    }
    
    console.log('认证中间件传递的用户信息:', req.user);
    console.log('获取访客邀请记录请求，用户ID:', req.user?.id);
    
    // 如果用户ID为空，返回错误
    if (!req.user || !req.user.id) {
      return res.json({
        code: 401,
        message: '未获取到用户信息，请重新登录'
      });
    }
    
    const userId = req.user.id;
    
    const connection = await pool.getConnection();
    try {
      // 先查询用户信息，确认用户存在
      const [userCheck] = await connection.execute(
        'SELECT * FROM owner_info WHERE id = ?',
        [userId]
      );
      
      console.log(`用户ID ${userId} 查询结果:`, userCheck.length > 0 ? '用户存在' : '用户不存在');
      
      if (userCheck.length === 0) {
        return res.json({
          code: 404,
          message: '用户不存在'
        });
      }
      
      // 查询SQL
      const sql = `SELECT vi.*, ci.community_name, hi.house_full_name 
                  FROM visitor_invitation vi
                  JOIN community_info ci ON vi.community_id = ci.id
                  JOIN house_info hi ON vi.house_id = hi.id
                  WHERE vi.owner_id = ?
                  ORDER BY vi.created_at DESC`;
      
      console.log('执行SQL:', sql);
      console.log('SQL参数:', [userId]);
      
      // 查询用户的访客邀请记录
      const [records] = await connection.execute(sql, [userId]);
      
      console.log(`查询到${records.length}条访客邀请记录`);
      if (records.length > 0) {
        console.log('第一条记录示例:', records[0]);
      }
      
      res.json({
        code: 200,
        message: '获取访客邀请记录成功',
        data: records
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取访客邀请记录错误:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 创建访客邀请
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // 从认证中间件获取用户ID
    const { visitorName, visitorPhone, visitDate, visitTime, remark } = req.body;
    
    console.log('创建访客邀请请求:', { 
      userId, visitorName, visitorPhone, visitDate, visitTime, remark 
    });
    
    if (!visitorName || !visitDate || !visitTime) {
      return res.json({
        code: 400,
        message: '缺少必要参数'
      });
    }
    
    // 生成随机访客码
    const visitorCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const connection = await pool.getConnection();
    try {
      // 获取用户的小区和房屋信息
      const [userInfo] = await connection.execute(
        `SELECT community_id, house_id FROM owner_info WHERE id = ?`,
        [userId]
      );
      
      console.log('用户信息查询结果:', userInfo);
      
      if (userInfo.length === 0) {
        return res.json({
          code: 404,
          message: '未找到用户信息'
        });
      }
      
      const { community_id, house_id } = userInfo[0];
      
      console.log('用户信息:', { community_id, house_id });
      
      // 检查表结构，确定字段是否存在
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM visitor_invitation`
      );
      
      const columnNames = columns.map(col => col.Field);
      console.log('visitor_invitation表字段:', columnNames);
      
      const hasPhoneField = columnNames.includes('visitor_phone');
      const hasRemarkField = columnNames.includes('remark');
      
      let sql, params;
      
      if (hasPhoneField && hasRemarkField) {
        // 完整字段版本
        sql = `INSERT INTO visitor_invitation 
               (community_id, house_id, owner_id, visitor_name, visitor_phone, visitor_code, remark, visit_date, visit_time, status, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        params = [community_id, house_id, userId, visitorName, visitorPhone || null, visitorCode, remark || null, visitDate, visitTime, 0];
      } else if (hasPhoneField) {
        // 有电话无备注
        sql = `INSERT INTO visitor_invitation 
               (community_id, house_id, owner_id, visitor_name, visitor_phone, visitor_code, visit_date, visit_time, status, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        params = [community_id, house_id, userId, visitorName, visitorPhone || null, visitorCode, visitDate, visitTime, 0];
      } else if (hasRemarkField) {
        // 有备注无电话
        sql = `INSERT INTO visitor_invitation 
               (community_id, house_id, owner_id, visitor_name, visitor_code, remark, visit_date, visit_time, status, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        params = [community_id, house_id, userId, visitorName, visitorCode, remark || null, visitDate, visitTime, 0];
      } else {
        // 原始版本
        sql = `INSERT INTO visitor_invitation 
               (community_id, house_id, owner_id, visitor_name, visitor_code, visit_date, visit_time, status, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
        params = [community_id, house_id, userId, visitorName, visitorCode, visitDate, visitTime, 0];
      }
      
      console.log('执行插入SQL:', sql);
      console.log('插入参数:', params);
      
      // 插入访客邀请记录
      const [result] = await connection.execute(sql, params);
      
      console.log('插入访客邀请记录成功，ID:', result.insertId);
      
      res.json({
        code: 200,
        message: '创建访客邀请成功',
        data: {
          id: result.insertId,
          visitorCode,
          community_id,
          house_id
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('创建访客邀请错误:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 取消访客邀请
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    console.log('认证中间件传递的用户信息:', req.user);
    
    // 如果用户ID为空，返回错误
    if (!req.user || !req.user.id) {
      return res.json({
        code: 401,
        message: '未获取到用户信息，请重新登录'
      });
    }
    
    const userId = req.user.id;
    const invitationId = req.params.id;
    
    console.log('取消访客邀请请求:', { userId, invitationId });
    
    const connection = await pool.getConnection();
    try {
      // 验证邀请记录是否属于当前用户
      const [records] = await connection.execute(
        `SELECT * FROM visitor_invitation WHERE id = ? AND owner_id = ?`,
        [invitationId, userId]
      );
      
      console.log(`验证访客邀请ID ${invitationId} 是否属于用户 ${userId}:`, records.length > 0 ? '验证通过' : '验证失败');
      
      if (records.length === 0) {
        return res.json({
          code: 404,
          message: '未找到访客邀请记录或无权操作'
        });
      }
      
      // 更新状态为已取消(2)
      await connection.execute(
        `UPDATE visitor_invitation SET status = 2 WHERE id = ?`,
        [invitationId]
      );
      
      console.log('访客邀请已取消，ID:', invitationId);
      
      res.json({
        code: 200,
        message: '取消访客邀请成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('取消访客邀请错误:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router; 