const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 验证token中间件
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.json({ code: 401, message: '未授权' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.json({ code: 401, message: 'token无效' });
  }
};

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/repair');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'repair-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 限制5MB
});

// 提交维修申请
router.post('/submit', verifyToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, type, location } = req.body;
    const userId = req.userId;
    
    if (!title || !description || !type) {
      return res.json({ code: 400, message: '参数不完整' });
    }
    
    // 处理上传的图片
    const images = req.files ? req.files.map(file => `/uploads/repair/${file.filename}`).join(',') : '';
    
    const connection = await pool.getConnection();
    
    try {
      // 获取用户所在社区
      const [owners] = await connection.execute(
        'SELECT community_id FROM owner_info WHERE id = ?',
        [userId]
      );
      
      if (owners.length === 0) {
        return res.json({ code: 404, message: '用户不存在' });
      }
      
      const communityId = owners[0].community_id || 0;
      
      // 插入维修记录
      const [result] = await connection.execute(
        `INSERT INTO repair_order 
         (owner_id, title, description, type, location, images, status, community_id, create_time) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW())`,
        [userId, title, description, type, location, images, communityId]
      );
      
      res.json({
        code: 200,
        message: '提交成功',
        data: {
          id: result.insertId
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('提交维修申请错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取维修列表
router.get('/list', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const status = req.query.status || 'all';
    
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT r.*, 
               DATE_FORMAT(r.create_time, '%Y-%m-%d %H:%i:%s') as formatted_create_time,
               DATE_FORMAT(r.update_time, '%Y-%m-%d %H:%i:%s') as formatted_update_time
        FROM repair_order r
        WHERE r.owner_id = ?
      `;
      
      const params = [userId];
      
      if (status !== 'all') {
        query += ' AND r.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY r.create_time DESC';
      
      const [repairs] = await connection.execute(query, params);
      
      // 处理图片路径
      repairs.forEach(repair => {
        if (repair.images) {
          repair.image_list = repair.images.split(',');
        } else {
          repair.image_list = [];
        }
      });
      
      res.json({
        code: 200,
        message: '获取成功',
        data: repairs
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取维修列表错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取维修详情
router.get('/detail/:id', verifyToken, async (req, res) => {
  try {
    const repairId = req.params.id;
    const userId = req.userId;
    
    const connection = await pool.getConnection();
    
    try {
      const [repairs] = await connection.execute(
        `SELECT r.*, 
                DATE_FORMAT(r.create_time, '%Y-%m-%d %H:%i:%s') as formatted_create_time,
                DATE_FORMAT(r.update_time, '%Y-%m-%d %H:%i:%s') as formatted_update_time,
                a.name as admin_name, a.phone as admin_phone
         FROM repair_order r
         LEFT JOIN admin_info a ON r.admin_id = a.id
         WHERE r.id = ? AND r.owner_id = ?`,
        [repairId, userId]
      );
      
      if (repairs.length === 0) {
        return res.json({ code: 404, message: '维修单不存在或无权查看' });
      }
      
      const repair = repairs[0];
      
      // 处理图片路径
      if (repair.images) {
        repair.image_list = repair.images.split(',');
      } else {
        repair.image_list = [];
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: repair
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取维修详情错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 评价维修
router.post('/rate/:id', verifyToken, async (req, res) => {
  try {
    const repairId = req.params.id;
    const userId = req.userId;
    const { rating, comment } = req.body;
    
    if (!rating) {
      return res.json({ code: 400, message: '评分不能为空' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // 检查维修单是否存在且属于该用户
      const [repairs] = await connection.execute(
        'SELECT * FROM repair_order WHERE id = ? AND owner_id = ? AND status = "completed"',
        [repairId, userId]
      );
      
      if (repairs.length === 0) {
        return res.json({ code: 404, message: '维修单不存在、未完成或无权评价' });
      }
      
      // 更新评价
      await connection.execute(
        'UPDATE repair_order SET rating = ?, comment = ?, status = "rated", update_time = NOW() WHERE id = ?',
        [rating, comment || '', repairId]
      );
      
      res.json({
        code: 200,
        message: '评价成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('评价维修错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 取消维修申请
router.post('/cancel/:id', verifyToken, async (req, res) => {
  try {
    const repairId = req.params.id;
    const userId = req.userId;
    
    const connection = await pool.getConnection();
    
    try {
      // 检查维修单是否存在且属于该用户
      const [repairs] = await connection.execute(
        'SELECT * FROM repair_order WHERE id = ? AND owner_id = ? AND status = "pending"',
        [repairId, userId]
      );
      
      if (repairs.length === 0) {
        return res.json({ code: 404, message: '维修单不存在、已处理或无权取消' });
      }
      
      // 更新状态
      await connection.execute(
        'UPDATE repair_order SET status = "cancelled", update_time = NOW() WHERE id = ?',
        [repairId]
      );
      
      res.json({
        code: 200,
        message: '取消成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('取消维修申请错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router; 