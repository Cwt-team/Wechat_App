const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const authMiddleware = require('../middleware/auth');

const pool = mysql.createPool(config.mysql);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('获取报警记录请求，用户ID:', userId);
    console.log('请求头:', req.headers);
    
    if (!userId) {
      console.log('未获取到用户信息');
      return res.json({
        code: 401,
        message: '未获取到用户信息，请重新登录'
      });
    }

    const connection = await pool.getConnection();
    try {
      // 首先获取用户所在的小区ID
      const [userCommunities] = await connection.execute(
        `SELECT community_id 
         FROM owner_info 
         WHERE id = ?`,
        [userId]
      );

      console.log('用户社区查询结果:', userCommunities);
      
      if (!userCommunities.length) {
        console.log('未找到用户所在小区信息');
        return res.json({
          code: 404,
          message: '未找到用户所在小区信息'
        });
      }

      const communityId = userCommunities[0].community_id;
      console.log('用户所在社区ID:', communityId);

      // 获取该小区的报警记录
      const [records] = await connection.execute(
        `SELECT ar.*, ci.community_name, hi.house_full_name 
         FROM alarm_record ar
         JOIN community_info ci ON ar.community_id = ci.id
         JOIN house_info hi ON ar.house_id = hi.id
         WHERE ar.community_id = ?
         ORDER BY ar.first_alarm_time DESC`,
        [communityId]
      );
      
      console.log(`查询到${records.length}条报警记录`);

      res.json({
        code: 200,
        message: '获取报警记录成功',
        data: records
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取报警记录错误:', error);
    res.json({
      code: 500,
      message: '服务器错误，请稍后重试'
    });
  }
});

module.exports = router; 