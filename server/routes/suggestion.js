const express = require('express');
const router = express.Router();
const dbUtils = require('../utils/dbUtils');
const verifyToken = require('../middleware/verifyToken');

// 提交投诉建议
router.post('/submit', verifyToken, async (req, res) => {
  console.log('收到投诉建议提交请求');
  console.log('请求头信息:', req.headers);
  console.log('用户ID:', req.userId);
  console.log('请求数据:', req.body);
  
  try {
    const { type, content, images } = req.body;
    
    // 获取用户所属社区ID
    console.log('查询用户所属社区');
    const [owners] = await dbUtils.execute(
      'SELECT community_id FROM owner_info WHERE id = ?',
      [req.userId]
    );
    
    if (owners.length === 0) {
      console.log('未找到用户信息');
      return res.json({ code: 404, message: '用户不存在' });
    }
    
    const communityId = owners[0].community_id;
    console.log('用户所属社区ID:', communityId);
    
    // 插入投诉建议记录
    console.log('准备插入投诉建议记录:', {
      communityId,
      userId: req.userId,
      type,
      content,
      imagesCount: images ? images.length : 0
    });
    
    const [result] = await dbUtils.execute(
      `INSERT INTO complaint_suggestions 
       (community_id, user_id, type, content, images, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [communityId, req.userId, type, content, images ? images.join(',') : null]
    );
    
    console.log('投诉建议记录插入成功, ID:', result.insertId);
    
    res.json({
      code: 200,
      message: '提交成功',
      data: { id: result.insertId }
    });
    
  } catch (error) {
    console.error('提交投诉建议失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取投诉建议历史记录
router.get('/history', verifyToken, async (req, res) => {
  console.log('收到获取投诉建议历史请求');
  console.log('请求头信息:', req.headers);
  console.log('用户ID:', req.userId);
  console.log('查询参数:', req.query);
  
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    console.log('分页参数:', { page, pageSize, offset });
    
    // 查询总数
    console.log('查询投诉建议总数');
    const [countResult] = await dbUtils.execute(
      'SELECT COUNT(*) as total FROM complaint_suggestions WHERE user_id = ?',
      [userId]
    );
    
    const total = countResult[0].total;
    console.log('投诉建议总数:', total);
    
    // 查询列表
    console.log('查询投诉建议列表');
    const [suggestions] = await dbUtils.execute(
      `SELECT 
        id, type, content, images, status, reply, 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        DATE_FORMAT(reply_time, '%Y-%m-%d %H:%i:%s') as reply_time
       FROM complaint_suggestions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );
    
    console.log(`查询到 ${suggestions.length} 条记录`);
    
    // 处理图片路径
    suggestions.forEach(item => {
      item.images = item.images ? item.images.split(',') : [];
      console.log(`处理记录 ${item.id} 的图片, 共 ${item.images.length} 张`);
    });
    
    res.json({
      code: 200,
      data: {
        total: countResult[0].total,
        list: suggestions,
        page,
        pageSize
      }
    });
    
  } catch (error) {
    console.error('获取投诉建议历史失败:', error);
    console.error('错误详情:', error.stack);
    res.json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router; 