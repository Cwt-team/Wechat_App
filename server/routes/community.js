const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// 数据库连接池
const pool = mysql.createPool({
  ...config.mysql,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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

// 获取社区评价列表
router.get('/reviews', async (req, res) => {
  try {
    const { communityId } = req.query;
    
    if (!communityId) {
      return res.json({ code: 400, message: '参数不完整' });
    }
    
    const connection = await pool.getConnection();
    try {
      const [reviews] = await connection.execute(
        `SELECT cr.*, oi.nickname, oi.avatar_url
         FROM community_reviews cr
         LEFT JOIN owner_info oi ON cr.user_id = oi.id
         WHERE cr.community_id = ?
         ORDER BY cr.created_at DESC`,
        [communityId]
      );
      
      // 处理图片路径
      const processedReviews = reviews.map(review => {
        return {
          ...review,
          images: review.images ? review.images.split(',') : []
        };
      });
      
      res.json({
        code: 200,
        message: '获取成功',
        data: processedReviews
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取社区评价错误:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取用户所在社区信息
router.get('/user-community', authMiddleware, async (req, res) => {
  try {
    console.log('收到获取用户社区信息请求');
    console.log('请求头信息:', req.headers);
    console.log('认证中间件传递的用户信息:', req.user);
    
    const userId = req.user.id;
    console.log('获取用户社区信息请求，用户ID:', userId);
    
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
      // 查询用户信息
      const [owners] = await connection.execute(
        `SELECT oi.id, oi.community_id, ci.community_name
         FROM owner_info oi
         LEFT JOIN community_info ci ON oi.community_id = ci.id
         WHERE oi.id = ?`,
        [userId]
      );
      
      if (owners.length === 0) {
        return res.json({
          code: 404,
          message: '未找到用户信息'
        });
      }
      
      const owner = owners[0];
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          communityId: owner.community_id,
          communityName: owner.community_name
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取用户社区信息错误:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 提交社区评价
router.post('/review', authMiddleware, async (req, res) => {
  try {
    console.log('收到提交社区评价请求');
    console.log('请求头信息:', req.headers);
    console.log('认证中间件传递的用户信息:', req.user);
    
    const userId = req.user.id;
    console.log('提交社区评价请求，用户ID:', userId);
    
    if (!userId) {
      console.log('未获取到用户ID');
      return res.json({
        code: 401,
        message: '未获取到用户信息，请重新登录'
      });
    }
    
    const { communityId, rating, content, images } = req.body;
    
    if (!communityId || !rating) {
      return res.json({
        code: 400,
        message: '参数不完整'
      });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // 检查社区是否存在
      console.log('检查社区是否存在, ID:', communityId);
      const [communities] = await connection.execute(
        'SELECT id FROM community_info WHERE id = ?',
        [communityId]
      );
      
      console.log('查询结果:', communities);
      
      if (communities.length === 0) {
        console.log('社区不存在');
        return res.json({ code: 404, message: '社区不存在' });
      }
      
      // 保存评价
      console.log('保存评价数据');
      const [result] = await connection.execute(
        'INSERT INTO community_reviews (community_id, user_id, rating, comment, images, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [communityId, userId, rating, content, images ? images.join(',') : '']
      );
      
      console.log('评价保存成功, ID:', result.insertId);
      
      res.json({
        code: 200,
        message: '评价提交成功',
        data: { id: result.insertId }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('提交社区评价错误:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 获取用户评价历史
router.get('/review/history', authMiddleware, async (req, res) => {
  try {
    console.log('收到获取评价历史请求');
    console.log('请求头信息:', req.headers);
    console.log('认证中间件传递的用户信息:', req.user);
    
    const userId = req.user.id;
    console.log('获取评价历史请求，用户ID:', userId);
    
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
      const [reviews] = await connection.execute(
        `SELECT cr.*, ci.community_name
         FROM community_reviews cr
         JOIN community_info ci ON cr.community_id = ci.id
         WHERE cr.user_id = ?
         ORDER BY cr.created_at DESC`,
        [userId]
      );
      
      console.log(`查询到${reviews.length}条评价记录`);
      if (reviews.length > 0) {
        console.log('第一条记录示例:', reviews[0]);
      }
      
      // 处理图片路径
      const processedReviews = reviews.map(review => {
        return {
          ...review,
          images: review.images ? review.images.split(',') : []
        };
      });
      
      res.json({
        code: 200,
        message: '获取成功',
        data: processedReviews
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取评价历史错误:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router; 