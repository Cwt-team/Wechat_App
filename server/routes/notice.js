const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const jwt = require('jsonwebtoken');

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

// 获取通知列表
router.get('/list', verifyToken, async (req, res) => {
  console.log('收到获取通知列表请求')
  console.log('请求参数:', req.query)
  console.log('用户Token:', req.headers.authorization)
  
  try {
    const userId = req.userId
    console.log('当前用户ID:', userId)
    
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const offset = (page - 1) * pageSize
    
    console.log('分页参数:', { page, pageSize, offset })
    
    const connection = await pool.getConnection()
    console.log('数据库连接成功')
    
    try {
      // 获取用户所在社区
      const [owners] = await connection.execute(
        'SELECT community_id FROM owner_info WHERE id = ?',
        [userId]
      )
      
      console.log('查询用户社区结果:', owners)
      
      if (owners.length === 0) {
        console.log('未找到用户信息')
        return res.json({ code: 404, message: '用户不存在' })
      }
      
      const communityId = owners[0].community_id || 0
      console.log('用户所在社区ID:', communityId)
      
      // 查询通知
      const [notices] = await connection.execute(
        `SELECT n.*, a.name as admin_name, 
                DATE_FORMAT(n.create_time, '%Y-%m-%d %H:%i:%s') as formatted_create_time
         FROM notice n
         LEFT JOIN admin_info a ON n.admin_id = a.id
         WHERE n.community_id = ? OR n.community_id = 0
         ORDER BY n.create_time DESC
         LIMIT ?, ?`,
        [communityId, offset, pageSize]
      )
      
      console.log(`查询到${notices.length}条通知`)
      
      // 查询总数
      const [countResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM notice WHERE community_id = ? OR community_id = 0',
        [communityId]
      )
      
      const total = countResult[0].total
      console.log('通知总数:', total)
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          list: notices,
          pagination: {
            current: page,
            pageSize: pageSize,
            total: total
          }
        }
      })
    } finally {
      connection.release()
      console.log('数据库连接已释放')
    }
  } catch (error) {
    console.error('获取通知列表错误:', error)
    res.json({ code: 500, message: '服务器错误' })
  }
})

// 获取通知详情
router.get('/detail/:id', verifyToken, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const userId = req.userId;
    
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
      
      // 查询通知
      const [notices] = await connection.execute(
        `SELECT n.*, a.name as admin_name, a.avatar_url as admin_avatar,
                DATE_FORMAT(n.create_time, '%Y-%m-%d %H:%i:%s') as formatted_create_time
         FROM notice n
         LEFT JOIN admin_info a ON n.admin_id = a.id
         WHERE n.id = ? AND (n.community_id = ? OR n.community_id = 0)`,
        [noticeId, communityId]
      );
      
      if (notices.length === 0) {
        return res.json({ code: 404, message: '通知不存在或无权查看' });
      }
      
      const notice = notices[0];
      
      // 更新已读状态
      await connection.execute(
        `INSERT INTO notice_read (notice_id, owner_id, read_time)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE read_time = NOW()`,
        [noticeId, userId]
      );
      
      res.json({
        code: 200,
        message: '获取成功',
        data: notice
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取通知详情错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取未读通知数量
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
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
      
      // 查询未读通知数量
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as unread_count
         FROM notice n
         LEFT JOIN notice_read nr ON n.id = nr.notice_id AND nr.owner_id = ?
         WHERE (n.community_id = ? OR n.community_id = 0) AND nr.id IS NULL`,
        [userId, communityId]
      );
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          unread_count: countResult[0].unread_count
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取未读通知数量错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 标记通知为已读
router.post('/mark-read/:id', verifyToken, async (req, res) => {
  try {
    const noticeId = req.params.id;
    const userId = req.userId;
    
    const connection = await pool.getConnection();
    
    try {
      // 更新已读状态
      await connection.execute(
        `INSERT INTO notice_read (notice_id, owner_id, read_time)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE read_time = NOW()`,
        [noticeId, userId]
      );
      
      res.json({
        code: 200,
        message: '标记成功'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('标记通知已读错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 标记所有通知为已读
router.post('/mark-all-read', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
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
      
      // 获取所有未读通知
      const [notices] = await connection.execute(
        `SELECT n.id
         FROM notice n
         LEFT JOIN notice_read nr ON n.id = nr.notice_id AND nr.owner_id = ?
         WHERE (n.community_id = ? OR n.community_id = 0) AND nr.id IS NULL`,
        [userId, communityId]
      );
      
      // 批量插入已读记录
      if (notices.length > 0) {
        const values = notices.map(notice => `(${notice.id}, ${userId}, NOW())`).join(',');
        
        await connection.query(
          `INSERT INTO notice_read (notice_id, owner_id, read_time)
           VALUES ${values}
           ON DUPLICATE KEY UPDATE read_time = NOW()`
        );
      }
      
      res.json({
        code: 200,
        message: '标记成功',
        data: {
          marked_count: notices.length
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('标记所有通知已读错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router; 