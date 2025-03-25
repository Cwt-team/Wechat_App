const express = require('express');
const router = express.Router();
const { query } = require('../utils/dbUtils');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const authMiddleware = require('../middleware/auth');
const { handleImagesUpload } = require('../utils/fileUpload');

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
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 验证token中间件
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];

        jwt.verify(token, process.env.JWT_SECRET || 'wuye_secret_key', (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    code: 403,
                    message: '无效的token'
                });
            }

            req.user = decoded;
            next();
        });
    } else {
        return res.status(403).json({
            code: 403,
            message: '未提供token'
        });
    }
};

// 生成报修单号
function generateRequestNumber() {
    const dateStr = moment().format('YYYYMMDD');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MR${dateStr}${randomStr}`;
}

// 生成随机12位报修码
function generateRequestCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 获取用户的报修列表
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { page = 1, size = 10, status } = req.query;
        const openid = req.user.openid;

        if (!openid) {
            return res.status(400).json({
                code: 400,
                message: '缺少必要参数'
            });
        }

        // 构建基础查询
        let sql = `
      SELECT 
        m.id, 
        m.request_code,
        m.request_number, 
        m.title, 
        m.description, 
        m.type, 
        m.priority, 
        m.status, 
        m.report_time, 
        m.complete_time,
        c.community_name,
        h.house_full_name
      FROM maintenance_request m
      JOIN community_info c ON m.community_id = c.id
      JOIN house_info h ON m.house_id = h.id
      JOIN user_house_relation uhr ON h.id = uhr.house_id
      JOIN user_info u ON uhr.user_id = u.id
      WHERE u.openid = ? AND m.is_deleted = 0
    `;

        const countSql = `
      SELECT COUNT(*) as total
      FROM maintenance_request m
      JOIN house_info h ON m.house_id = h.id
      JOIN user_house_relation uhr ON h.id = uhr.house_id
      JOIN user_info u ON uhr.user_id = u.id
      WHERE u.openid = ? AND m.is_deleted = 0
    `;

        const params = [openid];
        const countParams = [openid];

        // 添加状态筛选
        if (status) {
            sql += ` AND m.status = ?`;
            countSql += ` AND m.status = ?`;
            params.push(status);
            countParams.push(status);
        }

        // 添加排序和分页
        sql += ` ORDER BY m.report_time DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(size), (parseInt(page) - 1) * parseInt(size));

        // 执行查询
        const [repairList, countResult] = await Promise.all([
            query(sql, params),
            query(countSql, countParams)
        ]);

        // 格式化日期和处理图片
        const formattedList = repairList.map(item => {
            // 处理日期格式
            if (item.report_time) {
                item.report_time = moment(item.report_time).format('YYYY-MM-DD HH:mm:ss');
            }
            if (item.complete_time) {
                item.complete_time = moment(item.complete_time).format('YYYY-MM-DD HH:mm:ss');
            }

            // 处理图片
            if (item.images) {
                try {
                    item.image_list = JSON.parse(item.images);
                } catch (e) {
                    item.image_list = item.images.split(',');
                }
            } else {
                item.image_list = [];
            }

            return item;
        });

        return res.json({
            code: 200,
            message: '获取成功',
            data: {
                total: countResult[0].total,
                list: formattedList,
                page: parseInt(page),
                size: parseInt(size)
            }
        });
    } catch (error) {
        console.error('获取报修列表错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器错误，请稍后重试'
        });
    }
});

// 获取报修详情
router.get('/detail/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const openid = req.user.openid;

        if (!id || !openid) {
            return res.status(400).json({
                code: 400,
                message: '缺少必要参数'
            });
        }

        // 验证用户是否有权限查看该报修
        const authSql = `
      SELECT COUNT(*) as count
      FROM maintenance_request m
      JOIN house_info h ON m.house_id = h.id
      JOIN user_house_relation uhr ON h.id = uhr.house_id
      JOIN user_info u ON uhr.user_id = u.id
      WHERE m.id = ? AND u.openid = ?
    `;

        const authResult = await query(authSql, [id, openid]);

        if (authResult[0].count === 0) {
            return res.status(403).json({
                code: 403,
                message: '无权查看该报修'
            });
        }

        // 查询报修详情
        const sql = `
      SELECT 
        m.*,
        c.community_name,
        h.house_full_name,
        h.building_number,
        h.unit_number,
        h.room_number,
        a.name as staff_name,
        a.phone as staff_phone
      FROM maintenance_request m
      JOIN community_info c ON m.community_id = c.id
      JOIN house_info h ON m.house_id = h.id
      LEFT JOIN admin_info a ON m.staff_id = a.id
      WHERE m.id = ?
    `;

        const result = await query(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '报修不存在'
            });
        }

        // 格式化日期和图片
        const item = result[0];

        // 处理日期
        if (item.report_time) {
            item.report_time = moment(item.report_time).format('YYYY-MM-DD HH:mm:ss');
        }
        if (item.complete_time) {
            item.complete_time = moment(item.complete_time).format('YYYY-MM-DD HH:mm:ss');
        }
        if (item.evaluation_time) {
            item.evaluation_time = moment(item.evaluation_time).format('YYYY-MM-DD HH:mm:ss');
        }

        // 处理图片
        if (item.images) {
            try {
                item.image_list = JSON.parse(item.images);
            } catch (e) {
                item.image_list = item.images.split(',');
            }
        } else {
            item.image_list = [];
        }

        return res.json({
            code: 200,
            message: '获取成功',
            data: item
        });
    } catch (error) {
        console.error('获取报修详情错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器错误，请稍后重试'
        });
    }
});

// 提交报修接口
router.post('/submit', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const {
            house_id,
            community_id,
            reporter_name,
            reporter_phone,
            title,
            description,
            type,
            priority = 'normal',
            expected_time,
            openid: clientOpenid,
        } = req.body;

        // 从token中获取用户信息，或使用客户端提供的openid
        const userId = req.user.id;
        const openid = req.user.openid || clientOpenid || req.body.openid;

        // 添加调试日志
        console.log('用户信息:', { userId, openid, tokenInfo: req.user });
        console.log('请求参数:', req.body);

        if (!openid) {
            return res.status(400).json({
                code: 400,
                message: '无法识别用户信息，请重新登录'
            });
        }

        if (!community_id || !house_id || !title || !description || !type) {
            // 具体说明缺少哪些参数，便于调试
            const missingParams = [];
            if (!community_id) missingParams.push('community_id');
            if (!house_id) missingParams.push('house_id');
            if (!title) missingParams.push('title');
            if (!description) missingParams.push('description');
            if (!type) missingParams.push('type');

            return res.status(400).json({
                code: 400,
                message: `缺少必要参数: ${missingParams.join(', ')}`
            });
        }

        // 验证用户是否有权限为该房屋报修
        const authSql = `
      SELECT u.id
      FROM user_info u
      WHERE u.openid = ? AND (
        EXISTS (
          SELECT 1 FROM user_house_relation uhr 
          WHERE uhr.user_id = u.id AND uhr.house_id = ?
        ) OR u.room_number = ?
      )
    `;

        const authResult = await query(authSql, [openid, house_id, house_id]);

        if (authResult.length === 0) {
            return res.status(403).json({
                code: 403,
                message: '无权为该房屋提交报修'
            });
        }

        // 生成报修单号和报修码
        const requestNumber = generateRequestNumber();
        const requestCode = generateRequestCode();

        // 获取上传的图片路径
        const images = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];
        const images_url = JSON.stringify(images);

        // 插入报修记录
        const insertSql = `
      INSERT INTO maintenance_request (
        request_code,
        request_number,
        community_id,
        house_id,
        reporter_name,
        reporter_phone,
        title,
        description,
        type,
        priority,
        expected_time,
        images,
        status,
        report_time,
        is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
    `;

        const result = await query(insertSql, [
            requestCode,
            requestNumber,
            community_id,
            house_id,
            reporter_name,
            reporter_phone,
            title,
            description,
            type,
            priority,
            expected_time,
            images_url
        ]);

        return res.json({
            code: 200,
            message: '报修提交成功',
            data: {
                id: result.insertId,
                request_code: requestCode
            }
        });
    } catch (error) {
        console.error('提交维修申请错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器错误，请稍后重试'
        });
    }
});

// 取消报修
router.post('/cancel/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const openid = req.user.openid;

        if (!id || !openid) {
            return res.status(400).json({
                code: 400,
                message: '缺少必要参数'
            });
        }

        // 验证用户是否有权限取消该报修
        const authSql = `
      SELECT m.id, m.status
      FROM maintenance_request m
      JOIN house_info h ON m.house_id = h.id
      JOIN user_house_relation uhr ON h.id = uhr.house_id
      JOIN user_info u ON uhr.user_id = u.id
      WHERE m.id = ? AND u.openid = ?
    `;

        const authResult = await query(authSql, [id, openid]);

        if (authResult.length === 0) {
            return res.status(403).json({
                code: 403,
                message: '无权取消该报修'
            });
        }

        const status = authResult[0].status;
        if (status !== 'pending') {
            return res.status(400).json({
                code: 400,
                message: '只能取消待处理的报修'
            });
        }

        // 更新报修状态为已取消
        const updateSql = `
      UPDATE maintenance_request
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ?
    `;

        await query(updateSql, [id]);

        return res.json({
            code: 200,
            message: '报修已取消'
        });
    } catch (error) {
        console.error('取消报修错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器错误，请稍后重试'
        });
    }
});

// 提交评价
router.post('/evaluate/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { score, content, images = [] } = req.body;
        const openid = req.user.openid;

        if (!openid || !id || !score) {
            return res.status(400).json({
                code: 400,
                message: '缺少必要参数'
            });
        }

        // 验证用户是否有权限评价该报修
        const authSql = `
      SELECT m.id, m.status
      FROM maintenance_request m
      JOIN house_info h ON m.house_id = h.id
      JOIN user_house_relation uhr ON h.id = uhr.house_id
      JOIN user_info u ON uhr.user_id = u.id
      WHERE m.id = ? AND u.openid = ?
    `;

        const authResult = await query(authSql, [id, openid]);

        if (authResult.length === 0) {
            return res.status(403).json({
                code: 403,
                message: '无权评价该报修'
            });
        }

        const status = authResult[0].status;
        if (status !== 'completed') {
            return res.status(400).json({
                code: 400,
                message: '只能评价已完成的报修'
            });
        }

        // 处理图片上传
        const imageUrls = images.length > 0 ? handleImagesUpload(images) : [];

        // 更新评价信息
        const sql = `
      UPDATE maintenance_request
      SET 
        status = 'evaluated',
        evaluation_score = ?,
        evaluation_content = ?,
        evaluation_images = ?,
        evaluation_time = NOW(),
        updated_at = NOW()
      WHERE id = ?
    `;

        await query(sql, [
            score,
            content || '',
            imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
            id
        ]);

        return res.json({
            code: 200,
            message: '评价提交成功'
        });
    } catch (error) {
        console.error('提交评价失败:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器错误，请稍后重试'
        });
    }
});

// 获取报修类型选项
router.get('/types', (req, res) => {
    const types = [
        { value: 'water_electric', label: '水电维修' },
        { value: 'decoration', label: '装修维修' },
        { value: 'public_facility', label: '公共设施' },
        { value: 'clean', label: '保洁服务' },
        { value: 'security', label: '安保服务' },
        { value: 'other', label: '其他' }
    ];

    return res.json({
        code: 200,
        message: '获取成功',
        data: types
    });
});

// 获取优先级选项
router.get('/priorities', (req, res) => {
    const priorities = [
        { value: 'low', label: '低' },
        { value: 'normal', label: '普通' },
        { value: 'high', label: '高' },
        { value: 'urgent', label: '紧急' }
    ];

    return res.json({
        code: 200,
        message: '获取成功',
        data: priorities
    });
});

// 获取用户的房屋列表（用于选择报修房屋）
router.get('/user-houses', authMiddleware, async (req, res) => {
    try {
        const openid = req.user.openid;

        if (!openid) {
            return res.status(400).json({
                code: 400,
                message: '缺少必要参数'
            });
        }

        const sql = `
      SELECT 
        h.id as houseId,
        h.house_full_name,
        c.id as communityId,
        c.community_name
      FROM house_info h
      JOIN community_info c ON h.community_id = c.id
      JOIN user_house_relation uhr ON h.id = uhr.house_id
      JOIN user_info u ON uhr.user_id = u.id
      WHERE u.openid = ? AND h.is_deleted = 0
      ORDER BY c.community_name, h.house_full_name
    `;

        const houses = await query(sql, [openid]);

        return res.json({
            code: 200,
            message: '获取成功',
            data: houses
        });
    } catch (error) {
        console.error('获取用户房屋列表失败:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器错误，请稍后重试'
        });
    }
});

module.exports = router; 