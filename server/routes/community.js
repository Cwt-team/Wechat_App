const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const jwt = require('jsonwebtoken');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 获取社区列表
router.get('/list', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // 查询所有社区
      const [communities] = await connection.execute(
        'SELECT * FROM community_info ORDER BY id'
      );
      
      res.json({
        code: 200,
        message: '获取成功',
        data: communities
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取社区列表错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取社区详情
router.get('/detail/:id', async (req, res) => {
  const communityId = req.params.id;
  
  try {
    const connection = await pool.getConnection();
    
    try {
      // 查询社区信息
      const [communities] = await connection.execute(
        'SELECT * FROM community_info WHERE id = ?',
        [communityId]
      );
      
      if (communities.length === 0) {
        return res.json({ code: 404, message: '社区不存在' });
      }
      
      const community = communities[0];
      
      // 查询社区楼栋信息
      const [buildings] = await connection.execute(
        'SELECT * FROM building_info WHERE community_id = ? ORDER BY building_name',
        [communityId]
      );
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          ...community,
          buildings
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取社区详情错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取社区公告
router.get('/notices/:communityId', async (req, res) => {
  const communityId = req.params.communityId;
  
  try {
    const connection = await pool.getConnection();
    
    try {
      // 查询社区公告
      const [notices] = await connection.execute(
        `SELECT n.*, a.name as admin_name 
         FROM notice n 
         LEFT JOIN admin_info a ON n.admin_id = a.id
         WHERE n.community_id = ? OR n.community_id = 0
         ORDER BY n.create_time DESC`,
        [communityId]
      );
      
      res.json({
        code: 200,
        message: '获取成功',
        data: notices
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取社区公告错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取社区楼栋列表
router.get('/:communityId/buildings', async (req, res) => {
  const communityId = req.params.communityId;
  
  try {
    const connection = await pool.getConnection();
    
    try {
      // 查询社区楼栋
      const [buildings] = await connection.execute(
        'SELECT * FROM building_info WHERE community_id = ? ORDER BY building_name',
        [communityId]
      );
      
      res.json({
        code: 200,
        message: '获取成功',
        data: buildings
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取社区楼栋列表错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router; 