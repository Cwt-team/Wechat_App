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
    const userId = req.user.id; // 从认证中间件获取用户ID
    
    const connection = await pool.getConnection();
    try {
      // 查询用户关联的房屋的呼叫记录
      const [records] = await connection.execute(
        `SELECT cr.*, ci.community_name, hi.house_full_name 
         FROM call_record cr
         JOIN community_info ci ON cr.community_id = ci.id
         JOIN house_info hi ON cr.house_id = hi.id
         JOIN owner_permission op ON cr.house_id = op.house_id
         WHERE op.owner_id = ?
         ORDER BY cr.call_start_time DESC`,
        [userId]
      );
      
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