-- 创建数据库
CREATE DATABASE IF NOT EXISTS Wuye DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 使用数据库
USE Wuye;

-- 创建小区信息表
CREATE TABLE community_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    community_number VARCHAR(20) NOT NULL,
    community_name VARCHAR(100) NOT NULL,
    community_city VARCHAR(50) NOT NULL,
    creation_time DATETIME NOT NULL,
    is_enabled TINYINT NOT NULL COMMENT '0: disabled, 1: enabled',
    management_machine_quantity INT NOT NULL,
    indoor_machine_quantity INT NOT NULL,
    access_card_type VARCHAR(20) NOT NULL,
    app_record_face TINYINT NOT NULL COMMENT '0: disabled, 1: enabled',
    is_same_step TINYINT NOT NULL COMMENT '0: different, 1: same',
    is_record_upload TINYINT NOT NULL COMMENT '0: disabled, 1: enabled',
    community_password VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT INTO community_info
(community_number, community_name, community_city, creation_time, is_enabled,
management_machine_quantity, indoor_machine_quantity, access_card_type,
app_record_face, is_same_step, is_record_upload, community_password)
VALUES
('CN001', '阳光花园', '上海市', '2024-01-01 08:00:00', 1, 5, 200, 'NFC', 1, 1, 1, 'pwd123'),
('CN002', '翡翠湾', '北京市', '2024-01-15 09:30:00', 1, 3, 150, 'IC卡', 1, 0, 1, 'pwd456'),
('CN003', '康庄小区', '广州市', '2024-02-01 10:00:00', 1, 4, 180, 'NFC', 0, 1, 0, 'pwd789'),
('CN004', '龙湖苑', '深圳市', '2024-02-15 14:30:00', 0, 2, 100, 'IC卡', 1, 1, 1, 'pwd321'),
('CN005', '海风小区', '厦门市', '2024-03-01 11:15:00', 1, 6, 250, 'NFC', 1, 0, 1, 'pwd654');

-- 创建房屋信息表
CREATE TABLE house_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    community_id INT NOT NULL COMMENT '关联community_info表的id',
    district_number VARCHAR(10) COMMENT '区号',
    building_number VARCHAR(10) COMMENT '栋号',
    unit_number VARCHAR(10) COMMENT '单元号',
    house_full_name VARCHAR(100) NOT NULL COMMENT '完整房屋地址',
    house_level INT NOT NULL COMMENT '层级：1区、2栋、3单元',
    parent_id INT COMMENT '父级ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (parent_id) REFERENCES house_info(id)
);

-- 插入示例数据（基于前面小区的示例数据）
-- 先插入区
INSERT INTO house_info
(community_id, district_number, house_full_name, house_level, parent_id)
VALUES
(1, '1', '阳光花园1区', 1, NULL),
(1, '2', '阳光花园2区', 1, NULL),
(1, '5', '阳光花园5区', 1, NULL);

-- 插入栋
INSERT INTO house_info
(community_id, district_number, building_number, house_full_name, house_level, parent_id)
VALUES
-- 1区的楼栋
(1, '1', '1', '阳光花园1区1栋', 2, 1),
-- 2区的楼栋
(1, '2', '1', '阳光花园2区1栋', 2, 2),
-- 5区的楼栋
(1, '5', '42', '阳光花园5区42栋', 2, 3);

-- 插入单元
INSERT INTO house_info
(community_id, district_number, building_number, unit_number, house_full_name, house_level, parent_id)
VALUES
-- 1区1栋的单元
(1, '1', '1', '1', '阳光花园1区1栋1单元', 3, 4),
-- 2区1栋的单元
(1, '2', '1', '1', '阳光花园2区1栋1单元', 3, 5),
-- 5区42栋的单元
(1, '5', '42', '12', '阳光花园5区42栋12单元', 3, 6);

-- 创建管理员角色表
CREATE TABLE admin_role (
    id BIGINT PRIMARY KEY NOT NULL COMMENT '角色标识ID',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称',
    sort_number INT NOT NULL COMMENT '排序编号',
    description VARCHAR(200) COMMENT '角色描述',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_role_name` (`role_name`)
) COMMENT '管理员角色表';

-- 插入示例数据
INSERT INTO admin_role
(id, role_name, sort_number, description, created_at)
VALUES
(129295687549465048, '超级管理员', 10001, '系统最高权限管理员', '2024-01-15 10:15:30'),
(133272455163688408, '测试用户', 10001, '用于测试的临时角色', '2024-01-15 14:20:45'),
(133272455163688409, '物业管理员', 10002, '负责日常物业管理操作', '2024-01-15 16:30:00'),
(133272455163688410, '安保主管', 10003, '负责小区安防管理', '2024-01-16 09:45:15'),
(133272455163688411, '客服专员', 10004, '处理业主问题和反馈', '2024-01-16 11:20:30');

-- 创建小区管理员表
CREATE TABLE community_manager (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    other_name VARCHAR(50) NOT NULL COMMENT '别名',
    account_number VARCHAR(50) NOT NULL COMMENT '账号',
    character_type VARCHAR(50) NOT NULL COMMENT '角色',
    phone_number VARCHAR(20) NOT NULL COMMENT '手机号码',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_account_number` (`account_number`),
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (character_type) REFERENCES admin_role(role_name)
) COMMENT '小区管理员表';

-- 插入示例数据
INSERT INTO community_manager
(community_id, other_name, account_number, character_type, phone_number)
VALUES
-- 阳光花园的管理员
(1, '张经理', 'manager001', '物业管理员', '13800138001'),
(1, '王队长', 'security001', '安保主管', '13800138002'),
(1, '李客服', 'service001', '客服专员', '13800138003'),

-- 翡翠湾的管理员
(2, '刘经理', 'manager002', '物业管理员', '13800138004'),
(2, '赵安保', 'security002', '安保主管', '13800138005'),

-- 康庄小区的管理员
(3, '孙经理', 'manager003', '物业管理员', '13800138006'),
(3, '钱客服', 'service002', '客服专员', '13800138007'),

-- 龙湖苑的管理员
(4, '周经理', 'manager004', '物业管理员', '13800138008'),

-- 海风小区的管理员
(5, '吴经理', 'manager005', '物业管理员', '13800138009'),
(5, '郑客服', 'service003', '客服专员', '13800138010');

-- 创建物业管理员表
CREATE TABLE property_manager (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone_number VARCHAR(20) NOT NULL COMMENT '手机号码',
    remark VARCHAR(200) COMMENT '备注',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    face_image VARCHAR(200) COMMENT '人脸图片路径',
    face_status TINYINT DEFAULT 0 COMMENT '人脸状态：0-暂无数据 1-已录入',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    UNIQUE KEY `uk_phone_number` (`phone_number`)
) COMMENT '物业管理员表';

-- 插入示例数据
INSERT INTO property_manager
(community_id, name, phone_number, updated_at, remark)
VALUES
-- 崔庆科技小区的物业管理员
(1, '谢', '13711487267', '2024-06-08 11:40:49.266', NULL),
(1, '测试用', '13542406093', '2025-01-25 14:56:28.741', NULL),

-- 其他小区的物业管理员
(2, '王', '13800138001', '2024-01-15 09:30:00.000', '保洁主管'),
(2, '李', '13800138002', '2024-01-15 10:20:00.000', '维修组长'),
(3, '张', '13800138003', '2024-01-16 08:45:00.000', '园艺主管'),
(4, '刘', '13800138004', '2024-01-16 14:30:00.000', '设备维护'),
(5, '赵', '13800138005', '2024-01-17 11:20:00.000', '保安队长');

-- 业主信息表
CREATE TABLE owner_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '业主ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    house_id INT NOT NULL COMMENT '关联的房屋ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender CHAR(1) NOT NULL COMMENT '性别：M-男 F-女',
    phone_number VARCHAR(20) NOT NULL COMMENT '手机号码',
    id_card VARCHAR(18) COMMENT '身份证号',
    email VARCHAR(100) COMMENT '邮箱',
    city VARCHAR(50) COMMENT '户籍城市',
    address VARCHAR(200) COMMENT '详细地址',
    owner_type VARCHAR(20) NOT NULL DEFAULT '业主' COMMENT '业主类型',
    face_image VARCHAR(200) COMMENT '人脸图片路径',
    face_status TINYINT DEFAULT 0 COMMENT '人脸状态：0-未录入 1-已录入',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id),
    UNIQUE KEY `uk_phone_number` (`phone_number`),
    UNIQUE KEY `uk_id_card` (`id_card`)
) COMMENT '业主信息表';

-- 业主权限表
CREATE TABLE owner_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
    owner_id BIGINT NOT NULL COMMENT '业主ID',
    house_id INT NOT NULL COMMENT '房屋ID',
    permission_status VARCHAR(20) NOT NULL DEFAULT '正常' COMMENT '权限状态',
    valid_period VARCHAR(20) NOT NULL DEFAULT '永久有效' COMMENT '有效期',
    calling_enabled TINYINT(1) DEFAULT 1 COMMENT '呼叫功能启用状态',
    pstn_enabled TINYINT(1) DEFAULT 0 COMMENT '手机转接(PSTN)启用状态',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (owner_id) REFERENCES owner_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id)
) COMMENT '业主权限表';

-- 插入示例数据
INSERT INTO owner_info
(community_id, house_id, name, gender, phone_number, id_card, owner_type, updated_at)
VALUES
-- 崔氏科技小区的业主
(1, 1, '谢', 'M', '17362955521', NULL, '业主', '2024-07-30 10:10:24.586'),
(1, 2, '谢', 'M', '17362955522', NULL, '业主', '2024-07-30 09:50:30.203'),
(1, 3, '程', 'M', '13542406093', NULL, '业主', '2024-07-30 11:12:42.835'),
(1, 4, '业主', 'M', '13711487267', NULL, '业主', '2024-07-30 12:04:05.300'),
(1, 5, 'cui', 'M', '13542406094', NULL, '业主', '2024-08-03 15:27:25.602'),
(1, 6, 'xxx', 'M', '13509993912', '123456789000000', '业主', '2024-08-03 16:33:11.262');

-- 插入业主权限数据
INSERT INTO owner_permission
(owner_id, house_id, permission_status, valid_period, calling_enabled, pstn_enabled, updated_at)
VALUES
(1, 1, '正常', '永久有效', 1, 0, '2024-07-30 11:51:27.540'),
(2, 2, '正常', '永久有效', 1, 0, '2024-07-30 09:50:30.203'),
(3, 3, '正常', '永久有效', 1, 0, '2024-07-30 11:12:42.835'),
(4, 4, '正常', '永久有效', 1, 0, '2024-07-30 12:04:05.300'),
(5, 5, '正常', '永久有效', 1, 0, '2024-08-03 15:27:25.602'),
(6, 6, '正常', '永久有效', 1, 0, '2024-08-03 16:33:11.262');

-- 业主申请表
CREATE TABLE owner_application (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '申请ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    house_id INT NOT NULL COMMENT '关联的房屋ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender CHAR(1) NOT NULL COMMENT '性别：M-男 F-女',
    id_card VARCHAR(18) COMMENT '身份证号',
    phone_number VARCHAR(20) NOT NULL COMMENT '手机号码',
    application_status VARCHAR(20) NOT NULL COMMENT '申请状态', -- 例如：待审核，已通过，已拒绝，打回
    owner_type VARCHAR(20) NOT NULL DEFAULT '业主' COMMENT '业主类型',
    application_time DATETIME NOT NULL COMMENT '申请时间',
    information_photo VARCHAR(200) COMMENT '信息照片路径',
    callback_message VARCHAR(200) COMMENT '打回信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id),
    UNIQUE KEY `uk_application_phone_number` (`phone_number`),
    UNIQUE KEY `uk_application_id_card` (`id_card`)
) COMMENT '业主申请表';

-- 插入示例数据
INSERT INTO owner_application
(community_id, house_id, name, gender, id_card, phone_number, application_status, owner_type, application_time, information_photo, callback_message)
VALUES
(1, 6, 'lil', 'M', NULL, '13542406097', 'Returned', '业主', '2025-02-11 11:20:29', NULL, '不合格'),
(1, 5, '张三', 'F', '440307199001010011', '13912345678', 'Pending', '业主', '2025-03-15 14:30:00', '/path/to/zhangsan_photo.jpg', NULL);

-- 查询业主申请表数据
SELECT * FROM owner_application;

-- 房间通知表
CREATE TABLE room_notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    house_id INT COMMENT '关联的房屋ID (可选，如果通知可以针对特定房屋)', -- 根据实际需求，如果通知是广播到小区，可以不关联 house_id，或者设置为允许 NULL
    title VARCHAR(100) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    display_start_time DATE COMMENT '展示开始时间',
    display_end_time DATE COMMENT '展示结束时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间/创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id) -- 如果需要关联到 house_info
) COMMENT '房间通知表';

-- 插入示例数据
SELECT @community_id_1 := id FROM community_info WHERE community_name = '阳光花园';
SELECT @community_id_2 := id FROM community_info WHERE community_name = '翡翠湾';

INSERT INTO room_notification
(community_id, house_id, title, content, display_start_time, display_end_time, created_at)
VALUES
(@community_id_1, NULL, '紧急通知', '水管爆裂，请注意用水安全', '2025-02-12', '2025-02-12', '2024-08-03 04:37:20'),
(@community_id_1, NULL, '暴雨预警', '天气预报，今晚有暴雨，请关好门窗', '2025-02-12', '2025-02-12', '2024-07-30 11:33:32'),
(@community_id_2, NULL, '停电通知', '明日小区停电维护，请提前做好准备', '2025-03-01', '2025-03-01', '2024-08-05 09:00:00');

-- 查询房间通知表数据，验证插入是否成功
SELECT * FROM room_notification;

-- 小区通知表
CREATE TABLE community_notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    title VARCHAR(100) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    display_start_time DATE COMMENT '展示开始日期',
    display_end_time DATE COMMENT '展示结束日期',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间/创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id)
) COMMENT '小区通知表';

-- 插入示例数据
SELECT @community_id_1 := id FROM community_info WHERE community_name = '阳光花园';

INSERT INTO community_notification
(community_id, title, content, display_start_time, display_end_time, created_at)
VALUES
(@community_id_1, '杀虫', '请住户关好门窗', '2024-08-05', '2024-08-06', '2024-08-03 04:38:51'),
(@community_id_1, '暴雨预警', '天气预报', '2024-07-30', '2024-07-31', '2024-07-30 11:36:07');

-- 查询小区通知表数据，验证插入是否成功
SELECT * FROM community_notification;

-- 门口机内容管理表
CREATE TABLE door_machine_content_management (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '内容ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    screen_orientation ENUM('Landscape', 'Vertical') NOT NULL COMMENT '屏幕方向: Landscape-横屏, Vertical-竖屏',
    content_type VARCHAR(50) NOT NULL COMMENT '内容类型，例如：广告图片',
    content_path VARCHAR(200) NOT NULL COMMENT '内容路径，例如：图片URL或文件路径',
    display_start_time DATETIME COMMENT '展示开始时间',
    display_end_time DATETIME COMMENT '展示结束时间',
    is_enabled TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用：0-禁用，1-启用',
    sort_order INT COMMENT '排序顺序，用于内容轮播等场景',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id)
) COMMENT '门口机内容管理表';

-- 插入示例数据
SELECT @community_id_1 := id FROM community_info WHERE community_name = '阳光花园';

INSERT INTO door_machine_content_management
(community_id, screen_orientation, content_type, content_path, display_start_time, display_end_time, is_enabled, sort_order)
VALUES
(@community_id_1, 'Landscape', '图片广告', '/images/landscape_ad1.jpg', '2024-08-10 08:00:00', '2024-09-10 20:00:00', 1, 1),
(@community_id_1, 'Vertical', '图片广告', '/images/vertical_ad2.png', '2024-08-15 09:00:00', '2024-09-15 21:00:00', 1, 2),
(@community_id_1, 'Landscape', '图片广告', '/images/landscape_ad2.jpg', '2024-09-11 08:00:00', '2024-10-11 20:00:00', 0, 3);

-- 补充 door_machine_content_management 数据
INSERT INTO door_machine_content_management
(community_id, screen_orientation, content_type, content_path, display_start_time, display_end_time, is_enabled, sort_order)
VALUES
(2, 'Landscape', '视频广告', '/videos/community_intro.mp4', '2024-08-20 08:00:00', '2024-09-20 20:00:00', 1, 4),
(2, 'Vertical', '通知公告', '/images/notice1.jpg', '2024-08-25 09:00:00', '2024-09-25 21:00:00', 1, 5),
(3, 'Landscape', '宣传视频', '/videos/safety_guide.mp4', '2024-09-01 08:00:00', '2024-10-01 20:00:00', 1, 6);

-- 查询门口机内容管理表数据，验证插入是否成功
SELECT * FROM door_machine_content_management;

-- 呼叫记录表
CREATE TABLE call_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    house_id INT NOT NULL COMMENT '关联的房屋ID',
    door_access_info VARCHAR(200) COMMENT '门禁信息描述', -- 描述门禁位置或设备信息
    call_start_time DATETIME NOT NULL COMMENT '呼叫开始时间',
    call_duration INT UNSIGNED COMMENT '呼叫时长，单位秒',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id)
) COMMENT '呼叫记录表';

-- 先确认已存在的房屋数据
SELECT * FROM house_info;

-- 重新插入呼叫记录的示例数据
INSERT INTO call_record
(community_id, house_id, door_access_info, call_start_time, call_duration)
VALUES
-- 阳光花园的呼叫记录
(1, 4, '1区1栋1单元门口机', '2024-08-08 10:15:30', 35),
(1, 5, '2区1栋1单元门口机', '2024-08-08 14:20:00', 58),
(1, 6, '5区42栋12单元门口机', '2024-08-09 09:00:10', 120),
-- 更多示例数据
(1, 4, '1区1栋1单元门口机', '2024-08-10 08:30:00', 45),
(1, 4, '1区1栋1单元门口机', '2024-08-10 15:20:00', 25),
(1, 5, '2区1栋1单元门口机', '2024-08-11 11:10:00', 90),
(1, 6, '5区42栋12单元门口机', '2024-08-12 16:45:00', 60),
-- 翡翠湾的呼叫记录（需要先确认翡翠湾的房屋ID）
(2, 7, '1区1栋1单元门口机', '2024-08-09 10:30:00', 40),
(2, 7, '1区1栋1单元门口机', '2024-08-10 14:15:00', 55),
(2, 8, '2区1栋2单元门口机', '2024-08-11 09:20:00', 70),
-- 康庄小区的呼叫记录（需要先确认康庄小区的房屋ID）
(3, 8, '1区2栋1单元门口机', '2024-08-12 11:30:00', 65),
(3, 9, '2区1栋3单元门口机', '2024-08-13 16:40:00', 80);

-- 验证插入结果
SELECT 
    cr.*,
    ci.community_name,
    hi.house_full_name
FROM call_record cr
JOIN community_info ci ON cr.community_id = ci.id
JOIN house_info hi ON cr.house_id = hi.id
ORDER BY cr.call_start_time;

-- 报警记录表
CREATE TABLE alarm_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    house_id INT NOT NULL COMMENT '关联的房屋ID',
    alarm_type VARCHAR(50) NOT NULL COMMENT '报警类型', -- 例如：火警，盗警，医疗紧急等
    first_alarm_time DATETIME NOT NULL COMMENT '首次报警时间',
    latest_alarm_time DATETIME COMMENT '最新报警时间', -- 可以和首次报警时间相同，如果报警没有更新
    alarm_description TEXT COMMENT '报警描述信息，可选',
    alarm_status ENUM('Pending', 'Resolved', 'Processing') NOT NULL DEFAULT 'Pending' COMMENT '报警状态：Pending-待处理，Resolved-已解决，Processing-处理中',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id)
) COMMENT '报警记录表';

-- 先查看已存在的房屋数据
SELECT * FROM house_info;

-- 重新插入报警记录的示例数据
INSERT INTO alarm_record
(community_id, house_id, alarm_type, first_alarm_time, latest_alarm_time, alarm_description, alarm_status)
VALUES
-- 阳光花园的报警记录
(1, 4, '火警', '2024-08-08 08:30:00', '2024-08-08 08:30:00', '厨房烟雾感应器触发', 'Pending'),
(1, 5, '盗警', '2024-08-08 14:45:10', '2024-08-08 14:50:00', '门磁报警，疑似非法入侵', 'Processing'),
(1, 6, '医疗紧急', '2024-08-09 09:20:00', '2024-08-09 09:20:00', '住户紧急呼叫医疗帮助', 'Resolved'),
-- 更多示例数据
(1, 4, '火警', '2024-08-10 10:30:00', '2024-08-10 10:35:00', '烟雾报警器触发', 'Resolved'),
(1, 5, '盗警', '2024-08-11 02:15:00', '2024-08-11 02:20:00', '窗户传感器报警', 'Processing'),
-- 翡翠湾的报警记录
(2, 7, '火警', '2024-08-12 15:40:00', '2024-08-12 15:45:00', '厨房烟雾报警', 'Resolved'),
(2, 8, '医疗紧急', '2024-08-13 20:10:00', '2024-08-13 20:10:00', '老人跌倒报警', 'Processing');

-- 验证插入结果
SELECT 
    ar.*,
    ci.community_name,
    hi.house_full_name
FROM alarm_record ar
JOIN community_info ci ON ar.community_id = ci.id
JOIN house_info hi ON ar.house_id = hi.id
ORDER BY ar.first_alarm_time;

-- 开锁记录表
CREATE TABLE unlocking_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    house_id INT NOT NULL COMMENT '关联的房屋ID',
    device_type ENUM('Entrance Machine', 'Fencing Machine', 'Other') COMMENT '设备类型：Entrance Machine-门口机, Fencing Machine-围墙机, Other-其他',
    device_info VARCHAR(200) COMMENT '门禁设备信息描述', -- 例如：小区门口机，单元门禁，围墙机位置等
    unlocking_type VARCHAR(50) COMMENT '开锁类型', -- 例如：密码开锁，刷卡开锁，APP开锁，钥匙开锁
    unlocker VARCHAR(100) COMMENT '开锁人员/操作者', -- 可以记录用户名，用户ID或者描述信息
    unlocking_time DATETIME NOT NULL COMMENT '开锁时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id)
) COMMENT '开锁记录表';

-- 重新插入开锁记录的示例数据
INSERT INTO unlocking_record
(community_id, house_id, device_type, device_info, unlocking_type, unlocker, unlocking_time)
VALUES
-- 阳光花园的开锁记录
(1, 4, 'Entrance Machine', '1区1栋1单元门口机', '密码开锁', '业主本人', '2024-08-08 15:30:00'),
(1, 5, 'Fencing Machine', '小区南门围墙机', '刷卡开锁', '快递员', '2024-08-08 16:45:10'),
(1, 6, 'Other', '单元门禁', 'APP开锁', '系统自动', '2024-08-09 10:20:00'),
-- 更多示例数据
(1, 4, 'Entrance Machine', '1区1栋1单元门口机', '人脸识别', '访客', '2024-08-10 09:15:00'),
(1, 5, 'Entrance Machine', '2区1栋1单元门口机', '密码开锁', '业主家属', '2024-08-11 14:30:00'),
-- 翡翠湾的开锁记录
(2, 7, 'Entrance Machine', '1区1栋1单元门口机', '刷卡开锁', '业主本人', '2024-08-12 11:20:00'),
(2, 8, 'Fencing Machine', '小区北门围墙机', 'APP开锁', '物业人员', '2024-08-13 16:40:00');

-- 验证插入结果
SELECT 
    ur.*,
    ci.community_name,
    hi.house_full_name
FROM unlocking_record ur
JOIN community_info ci ON ur.community_id = ci.id
JOIN house_info hi ON ur.house_id = hi.id
ORDER BY ur.unlocking_time;

-- 个人信息表
CREATE TABLE personal_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    account_number VARCHAR(50) UNIQUE NOT NULL COMMENT '账号',
    nickname VARCHAR(50) COMMENT '别名/昵称',
    phone_number VARCHAR(20) UNIQUE COMMENT '手机号码',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    profile_picture_path VARCHAR(200) COMMENT '头像路径',
    password VARCHAR(50) NOT NULL COMMENT '密码',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '个人信息表';

INSERT INTO personal_info (account_number, nickname, phone_number, email, profile_picture_path, password, created_at)
VALUES
('user001', '小明', '13800000001', 'xiaoming@example.com', '/images/xiaoming.jpg', '123456', NOW()),
('user002', '小红', '13800000002', 'xiaohong@example.com', '/images/xiaohong.jpg', '123456', NOW()),
('user003', '小刚', '13800000003', 'xiaogang@example.com', '/images/xiaogang.jpg', '123456', NOW()),
('user004', '小丽', '13800000004', 'xiaoli@example.com', '/images/xiaoli.jpg', '123456', NOW()),
('user005', '小强', '13800000005', 'xiaoqiang@example.com', '/images/xiaoqiang.jpg', '123456', NOW());
-- 查询个人信息表数据，验证插入是否成功
SELECT * FROM personal_info;


-- 在owner_info表中添加微信openid字段
ALTER TABLE owner_info
ADD COLUMN wx_openid VARCHAR(50) UNIQUE COMMENT '微信openid';

-- 在personal_info表中添加微信openid字段
ALTER TABLE personal_info
ADD COLUMN wx_openid VARCHAR(50) UNIQUE COMMENT '微信openid';