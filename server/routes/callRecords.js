const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const authMiddleware = require('../middleware/auth');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 获取用户呼叫记录
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 打印请求头信息
    console.log('请求头信息:', req.headers);
    console.log('认证中间件传递的用户信息:', req.user);
    
    const userId = req.user.id;
    console.log('获取呼叫记录请求，用户ID:', userId);
    
    if (!userId) {
      console.log('未获取到用户ID');
      return res.json({
        code: 401,
        message: '未获取到用户信息，请重新登录'
      });
    }

    const connection = await pool.getConnection();
    try {
      console.log('执行SQL查询...');
      const [records] = await connection.execute(
        `SELECT cr.*, ci.community_name, hi.house_full_name 
         FROM call_record cr
         JOIN community_info ci ON cr.community_id = ci.id
         JOIN house_info hi ON cr.house_id = hi.id
         WHERE cr.owner_id = ?
         ORDER BY cr.call_start_time DESC`,
        [userId]
      );
      
      console.log(`查询到${records.length}条呼叫记录`);
      if (records.length > 0) {
        console.log('第一条记录示例:', records[0]);
      }

      res.json({
        code: 200,
        message: '获取呼叫记录成功',
        data: records
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取呼叫记录错误:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router; 