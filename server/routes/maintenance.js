const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/config');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('维修图片上传 - 创建目录');
    const uploadPath = path.join(__dirname, '../uploads/maintenance');
    if (!fs.existsSync(uploadPath)) {
      console.log('维修图片上传 - 目录不存在，创建目录:', uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    console.log('维修图片上传 - 文件名生成:', filename);
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// 数据库连接池
const pool = mysql.createPool(config.mysql);
console.log('维修模块 - 数据库连接池初始化');

// 生成报修单号
function generateRequestNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 生成4位随机数
  const requestNumber = `PR${year}${month}${day}${randomNum}`;
  console.log('维修模块 - 生成报修单号:', requestNumber);
  return requestNumber;
}

// 获取用户所在社区列表
router.get('/community/list', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  console.log('维修模块 - 获取用户社区列表, 用户ID:', userId);
  
  try {
    console.log('维修模块 - 开始获取数据库连接');
    const connection = await pool.getConnection();
    console.log('维修模块 - 成功获取数据库连接');
    
    try {
      // 首先查询用户所在的社区
      console.log('维修模块 - 执行查询: 获取用户社区');
      const [ownerCommunities] = await connection.execute(
        `SELECT ci.* 
         FROM community_info ci
         JOIN owner_info oi ON ci.id = oi.community_id
         WHERE oi.id = ?`,
        [userId]
      );
      
      console.log(`维修模块 - 查询结果: 用户有${ownerCommunities.length}个社区`);
      if (ownerCommunities.length > 0) {
        console.log('维修模块 - 社区列表第一项:', ownerCommunities[0]);
      }
      
      res.json({
        code: 200,
        message: '获取社区列表成功',
        data: ownerCommunities
      });
      console.log('维修模块 - 成功返回社区列表');
    } finally {
      console.log('维修模块 - 释放数据库连接');
      connection.release();
    }
  } catch (error) {
    console.error('维修模块 - 获取社区列表错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取用户房屋列表
router.get('/user-houses', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  console.log('维修模块 - 获取用户房屋信息, 用户ID:', userId);
  
  try {
    console.log('维修模块 - 开始获取数据库连接');
    const connection = await pool.getConnection();
    console.log('维修模块 - 成功获取数据库连接');
    
    try {
      // 查询用户所属房屋
      console.log('维修模块 - 执行查询: 获取用户房屋');
      const [houses] = await connection.execute(
        `SELECT hi.id, hi.house_full_name, hi.community_id, ci.community_name
         FROM house_info hi
         JOIN community_info ci ON hi.community_id = ci.id
         JOIN owner_info oi ON hi.id = oi.house_id
         WHERE oi.id = ?`,
        [userId]
      );
      
      console.log(`维修模块 - 查询结果: 用户有${houses.length}个房屋`);
      if (houses.length > 0) {
        console.log('维修模块 - 房屋列表第一项:', houses[0]);
      }
      
      res.json({
        code: 200,
        message: '获取用户房屋信息成功',
        data: houses
      });
      console.log('维修模块 - 成功返回房屋列表');
    } finally {
      console.log('维修模块 - 释放数据库连接');
      connection.release();
    }
  } catch (error) {
    console.error('维修模块 - 获取用户房屋信息错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 提交报修请求
router.post('/submit', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  console.log('维修模块 - 提交报修请求, 用户ID:', userId);
  console.log('维修模块 - 报修请求数据:', JSON.stringify(req.body));
  
  const { 
    communityId, 
    houseId, 
    title, 
    description, 
    type, 
    contactName, 
    contactPhone, 
    expectedDate, 
    expectedTime,
    images = [],
    isPublic = false
  } = req.body;
  
  // 验证必填字段
  console.log('维修模块 - 验证必填字段');
  if (!communityId || !title || !description || !type || !contactName || !contactPhone) {
    console.log('维修模块 - 必填字段缺失:', { communityId, title, description, type, contactName, contactPhone });
    return res.json({ code: 400, message: '请填写所有必填字段' });
  }

  try {
    console.log('维修模块 - 开始获取数据库连接');
    const connection = await pool.getConnection();
    console.log('维修模块 - 成功获取数据库连接');
    
    try {
      // 生成报修单号
      const requestNumber = generateRequestNumber();
      
      // 组合预约时间
      const expectedDateTime = expectedDate && expectedTime 
        ? `${expectedDate} ${expectedTime}:00` 
        : null;
      
      console.log('维修模块 - 预约时间:', expectedDateTime);
      
      // 图片处理
      const imagesJson = images && images.length > 0 ? JSON.stringify(images) : '[]';
      console.log(`维修模块 - 图片数量: ${images.length}, 图片JSON:`, imagesJson);
      
      // 确定是否为公共区域报修
      const finalHouseId = isPublic ? null : houseId;
      console.log('维修模块 - 是否公共区域:', isPublic, '最终房屋ID:', finalHouseId);
      
      // 插入报修记录
      console.log('维修模块 - 执行插入: 创建报修记录');
      const [result] = await connection.execute(
        `INSERT INTO maintenance_request (
          request_number, community_id, house_id, reporter_name, reporter_phone,
          title, description, type, priority, expected_time, images, status, report_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          requestNumber, 
          communityId, 
          finalHouseId,
          contactName,
          contactPhone,
          title,
          description,
          type,
          'normal', // 默认优先级
          expectedDateTime,
          imagesJson
        ]
      );
      
      const insertId = result.insertId;
      console.log('维修模块 - 报修记录创建成功, ID:', insertId);
      
      // 查询刚创建的报修信息
      console.log('维修模块 - 执行查询: 获取新创建的报修详情');
      const [maintenanceRequests] = await connection.execute(
        `SELECT mr.*, hi.house_full_name, ci.community_name 
         FROM maintenance_request mr
         LEFT JOIN house_info hi ON mr.house_id = hi.id
         LEFT JOIN community_info ci ON mr.community_id = ci.id
         WHERE mr.id = ?`,
        [insertId]
      );
      
      if (maintenanceRequests.length === 0) {
        console.log('维修模块 - 查询新创建的报修记录失败');
        return res.json({ code: 404, message: '创建报修记录失败' });
      }
      
      console.log('维修模块 - 新创建的报修详情:', JSON.stringify(maintenanceRequests[0]));
      
      res.json({
        code: 200,
        message: '报修提交成功',
        data: maintenanceRequests[0]
      });
      console.log('维修模块 - 成功返回报修创建结果');
    } finally {
      console.log('维修模块 - 释放数据库连接');
      connection.release();
    }
  } catch (error) {
    console.error('维修模块 - 提交报修请求错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取个人报修历史
router.get('/history', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  console.log('维修模块 - 获取报修历史, 用户ID:', userId);
  
  try {
    console.log('维修模块 - 开始获取数据库连接');
    const connection = await pool.getConnection();
    console.log('维修模块 - 成功获取数据库连接');
    
    try {
      // 根据用户ID查询所有报修记录
      console.log('维修模块 - 执行查询: 获取用户报修历史');
      const [maintenanceRequests] = await connection.execute(
        `SELECT mr.*, hi.house_full_name, ci.community_name 
        FROM maintenance_request mr
        LEFT JOIN house_info hi ON mr.house_id = hi.id
        LEFT JOIN community_info ci ON mr.community_id = ci.id
        WHERE (mr.house_id IN (SELECT house_id FROM owner_info WHERE id = ?) 
                OR (mr.reporter_phone = (SELECT phone_number FROM owner_info WHERE id = ?))) 
                AND mr.is_deleted = 0
        ORDER BY mr.report_time DESC`,
        [userId, userId]
      );
      
      console.log(`维修模块 - 查询结果: 用户有${maintenanceRequests.length}条报修记录`);
      if (maintenanceRequests.length > 0) {
        console.log('维修模块 - 报修历史第一项:', JSON.stringify(maintenanceRequests[0]));
      }
      
      res.json({
        code: 200,
        message: '获取报修历史成功',
        data: maintenanceRequests
      });
      console.log('维修模块 - 成功返回报修历史');
    } finally {
      console.log('维修模块 - 释放数据库连接');
      connection.release();
    }
  } catch (error) {
    console.error('维修模块 - 获取报修历史错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 获取报修详情
router.get('/detail/:id', authMiddleware, getMaintenanceDetail);
router.get('/detail', authMiddleware, getMaintenanceDetail);

// 提取处理函数
async function getMaintenanceDetail(req, res) {
  // 支持两种参数方式获取ID
  const maintenanceId = req.params.id || req.query.id;
  console.log('维修模块 - 获取报修详情, ID:', maintenanceId);
  
  if (!maintenanceId) {
    console.log('维修模块 - 未提供报修ID');
    return res.json({ code: 400, message: '请提供报修ID' });
  }

  try {
    console.log('维修模块 - 开始获取数据库连接');
    const connection = await pool.getConnection();
    console.log('维修模块 - 成功获取数据库连接');
    
    try {
      // 查询报修详情
      console.log('维修模块 - 执行查询: 获取报修详情');
      const [maintenanceRequests] = await connection.execute(
        `SELECT mr.*, ci.community_name, 
          CASE 
            WHEN mr.house_id IS NULL THEN '公共区域' 
            ELSE hi.house_full_name 
          END as house_full_name
         FROM maintenance_request mr
         JOIN community_info ci ON mr.community_id = ci.id
         LEFT JOIN house_info hi ON mr.house_id = hi.id
         WHERE mr.id = ? AND mr.is_deleted = 0`,
        [maintenanceId]
      );
      
      if (maintenanceRequests.length === 0) {
        console.log('维修模块 - 未找到报修记录');
        return res.json({ code: 404, message: '未找到报修记录' });
      }
      
      console.log('维修模块 - 报修详情:', JSON.stringify(maintenanceRequests[0]));
      
      res.json({
        code: 200,
        message: '获取报修详情成功',
        data: maintenanceRequests[0]
      });
      console.log('维修模块 - 成功返回报修详情');
    } finally {
      console.log('维修模块 - 释放数据库连接');
      connection.release();
    }
  } catch (error) {
    console.error('维修模块 - 获取报修详情错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
}

// 取消报修
router.post('/cancel/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const maintenanceId = req.params.id;
  console.log('维修模块 - 取消报修, 用户ID:', userId, '报修ID:', maintenanceId);
  
  try {
    console.log('维修模块 - 开始获取数据库连接');
    const connection = await pool.getConnection();
    console.log('维修模块 - 成功获取数据库连接');
    
    try {
      // 首先检查报修状态
      console.log('维修模块 - 执行查询: 检查报修状态');
      const [maintenanceRequests] = await connection.execute(
        `SELECT mr.*, oi.id as owner_id, oi.phone as owner_phone
         FROM maintenance_request mr
         LEFT JOIN house_info hi ON mr.house_id = hi.id
         LEFT JOIN owner_info oi ON hi.id = oi.house_id
         WHERE mr.id = ? AND mr.is_deleted = 0`,
        [maintenanceId]
      );
      
      if (maintenanceRequests.length === 0) {
        console.log('维修模块 - 未找到报修记录');
        return res.json({ code: 404, message: '未找到报修记录' });
      }
      
      const maintenance = maintenanceRequests[0];
      console.log('维修模块 - 报修状态:', maintenance.status);
      
      // 检查是否为待处理状态
      if (maintenance.status !== 'pending') {
        console.log('维修模块 - 报修状态不是待处理，无法取消');
        return res.json({ code: 400, message: '只能取消待处理的报修' });
      }
      
      // 检查是否为本人报修
      const isOwner = maintenance.owner_id === userId || maintenance.reporter_phone === maintenance.owner_phone;
      console.log('维修模块 - 是否为本人报修:', isOwner, {
        'maintenance.owner_id': maintenance.owner_id,
        'userId': userId,
        'maintenance.reporter_phone': maintenance.reporter_phone,
        'maintenance.owner_phone': maintenance.owner_phone
      });
      
      if (!isOwner) {
        console.log('维修模块 - 不是本人报修，无法取消');
        return res.json({ code: 403, message: '只能取消自己的报修' });
      }
      
      // 更新报修状态为已取消
      console.log('维修模块 - 执行更新: 取消报修');
      await connection.execute(
        `UPDATE maintenance_request SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
        [maintenanceId]
      );
      
      console.log('维修模块 - 报修取消成功');
      
      res.json({
        code: 200,
        message: '报修已取消'
      });
      console.log('维修模块 - 成功返回取消结果');
    } finally {
      console.log('维修模块 - 释放数据库连接');
      connection.release();
    }
  } catch (error) {
    console.error('维修模块 - 取消报修错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 评价报修服务
router.post('/evaluate/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const maintenanceId = req.params.id;
  const { score, content, images = [] } = req.body;
  
  console.log('维修模块 - 评价报修服务, 用户ID:', userId, '报修ID:', maintenanceId);
  console.log('维修模块 - 评价数据:', { score, content, imageCount: images.length });
  
  try {
    console.log('维修模块 - 开始获取数据库连接');
    const connection = await pool.getConnection();
    console.log('维修模块 - 成功获取数据库连接');
    
    try {
      // 首先检查报修状态
      console.log('维修模块 - 执行查询: 检查报修状态');
      const [maintenanceRequests] = await connection.execute(
        `SELECT mr.*, oi.id as owner_id, oi.phone as owner_phone
         FROM maintenance_request mr
         LEFT JOIN house_info hi ON mr.house_id = hi.id
         LEFT JOIN owner_info oi ON hi.id = oi.house_id
         WHERE mr.id = ? AND mr.is_deleted = 0`,
        [maintenanceId]
      );
      
      if (maintenanceRequests.length === 0) {
        console.log('维修模块 - 未找到报修记录');
        return res.json({ code: 404, message: '未找到报修记录' });
      }
      
      const maintenance = maintenanceRequests[0];
      console.log('维修模块 - 报修状态:', maintenance.status);
      
      // 检查是否为已完成状态
      if (maintenance.status !== 'completed') {
        console.log('维修模块 - 报修未完成，无法评价');
        return res.json({ code: 400, message: '只能评价已完成的报修' });
      }
      
      // 检查是否已经评价过
      if (maintenance.evaluation_score) {
        console.log('维修模块 - 已评价过，无法重复评价');
        return res.json({ code: 400, message: '该报修已经评价过了' });
      }
      
      // 检查是否为本人报修
      const isOwner = maintenance.owner_id === userId || maintenance.reporter_phone === maintenance.owner_phone;
      console.log('维修模块 - 是否为本人报修:', isOwner, {
        'maintenance.owner_id': maintenance.owner_id,
        'userId': userId,
        'maintenance.reporter_phone': maintenance.reporter_phone,
        'maintenance.owner_phone': maintenance.owner_phone
      });
      
      if (!isOwner) {
        console.log('维修模块 - 不是本人报修，无法评价');
        return res.json({ code: 403, message: '只能评价自己的报修' });
      }
      
      // 图片处理
      const imagesJson = images && images.length > 0 ? JSON.stringify(images) : null;
      console.log(`维修模块 - 评价图片数量: ${images.length}, 图片JSON:`, imagesJson);
      
      // 更新评价信息
      console.log('维修模块 - 执行更新: 添加评价');
      await connection.execute(
        `UPDATE maintenance_request 
         SET evaluation_score = ?, evaluation_content = ?, evaluation_images = ?, evaluation_time = NOW(), updated_at = NOW() 
         WHERE id = ?`,
        [score, content, imagesJson, maintenanceId]
      );
      
      console.log('维修模块 - 评价添加成功');
      
      res.json({
        code: 200,
        message: '评价成功'
      });
      console.log('维修模块 - 成功返回评价结果');
    } finally {
      console.log('维修模块 - 释放数据库连接');
      connection.release();
    }
  } catch (error) {
    console.error('维修模块 - 评价报修服务错误:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router; 