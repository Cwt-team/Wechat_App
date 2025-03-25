-- 创建数据库
CREATE DATABASE IF NOT EXISTS Wuye1 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 使用数据库
USE Wuye1;

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
('CN005', '海风小区', '厦门市', '2024-03-01 11:15:00', 1, 6, 250, 'NFC', 1, 0, 1, 'pwd654'),
('CN006', '金色家园', '重庆市', '2024-03-15 09:00:00', 1, 4, 180, 'NFC', 1, 1, 0, 'pwd987'),
('CN007', '绿洲花园', '武汉市', '2024-03-20 10:30:00', 1, 5, 220, 'IC卡', 0, 1, 1, 'pwd654'),
('CN008', '星河湾', '成都市', '2024-03-25 14:00:00', 1, 3, 160, 'NFC', 1, 0, 1, 'pwd321'),
('CN009', '御景园', '南京市', '2024-04-01 11:45:00', 1, 4, 190, 'IC卡', 1, 1, 0, 'pwd147'),
('CN010', '阳光城', '杭州市', '2024-04-05 16:20:00', 1, 5, 210, 'NFC', 0, 1, 1, 'pwd258'),
('CN011', '碧水湾', '苏州市', '2024-04-10 09:15:00', 1, 3, 150, 'IC卡', 1, 0, 1, 'pwd369'),
('CN012', '紫金府', '天津市', '2024-04-15 13:40:00', 0, 4, 170, 'NFC', 1, 1, 0, 'pwd741'),
('CN013', '翠竹园', '青岛市', '2024-04-20 10:50:00', 1, 6, 240, 'IC卡', 0, 1, 1, 'pwd852'),
('CN014', '凤凰城', '西安市', '2024-04-25 15:30:00', 1, 5, 200, 'NFC', 1, 0, 1, 'pwd963'),
('CN015', '香榭丽', '大连市', '2024-05-01 08:45:00', 1, 4, 180, 'IC卡', 1, 1, 0, 'pwd159'),
('CN016', '滨海湾', '厦门市', '2024-05-05 11:20:00', 1, 3, 140, 'NFC', 0, 1, 1, 'pwd357'),
('CN017', '江南府', '宁波市', '2024-05-10 14:15:00', 1, 5, 230, 'IC卡', 1, 0, 1, 'pwd486'),
('CN018', '云顶山', '福州市', '2024-05-15 09:30:00', 0, 4, 160, 'NFC', 1, 1, 0, 'pwd729'),
('CN019', '玫瑰园', '济南市', '2024-05-20 16:45:00', 1, 6, 250, 'IC卡', 0, 1, 1, 'pwd835'),
('CN020', '枫丹白露', '长沙市', '2024-05-25 10:10:00', 1, 5, 220, 'NFC', 1, 0, 1, 'pwd946');

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

-- 为新增小区添加区
INSERT INTO house_info
(community_id, district_number, house_full_name, house_level, parent_id)
SELECT id, '1', CONCAT(community_name, '1区'), 1, NULL
FROM community_info 
WHERE id > 5;

-- 为新增小区添加楼栋
INSERT INTO house_info
(community_id, district_number, building_number, house_full_name, house_level, parent_id)
SELECT h.community_id, h.district_number, '1', 
CONCAT(c.community_name, h.district_number, '区1栋'), 2, h.id
FROM house_info h
JOIN community_info c ON h.community_id = c.id
WHERE c.id > 5 AND h.house_level = 1;

-- 为新增小区添加单元
INSERT INTO house_info
(community_id, district_number, building_number, unit_number, house_full_name, house_level, parent_id)
SELECT h.community_id, h.district_number, h.building_number, '1',
CONCAT(c.community_name, h.district_number, '区', h.building_number, '栋1单元'), 3, h.id
FROM house_info h
JOIN community_info c ON h.community_id = c.id
WHERE c.id > 5 AND h.house_level = 2;

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
(133272455163688411, '客服专员', 10004, '处理业主问题和反馈', '2024-01-16 11:20:30'),
(133272455163688412, '设备管理员', 10005, '负责设备维护和管理', '2024-01-17 09:30:00'),
(133272455163688413, '保洁主管', 10006, '负责清洁卫生管理', '2024-01-17 10:45:00'),
(133272455163688414, '园艺主管', 10007, '负责绿化养护管理', '2024-01-17 14:20:00'),
(133272455163688415, '维修主管', 10008, '负责维修工作管理', '2024-01-17 16:00:00'),
(133272455163688416, '财务管理员', 10009, '负责财务相关工作', '2024-01-18 09:15:00'),
(133272455163688417, '人事管理员', 10010, '负责人事相关工作', '2024-01-18 11:30:00'),
(133272455163688418, '档案管理员', 10011, '负责档案管理工作', '2024-01-18 14:45:00'),
(133272455163688419, '巡查主管', 10012, '负责日常巡查工作', '2024-01-18 16:20:00'),
(133272455163688420, '车位管理员', 10013, '负责停车场管理', '2024-01-19 09:00:00'),
(133272455163688421, '门禁管理员', 10014, '负责门禁系统管理', '2024-01-19 10:30:00'),
(133272455163688422, '监控管理员', 10015, '负责监控系统管理', '2024-01-19 14:00:00'),
(133272455163688423, '仓库管理员', 10016, '负责物资仓库管理', '2024-01-19 15:45:00'),
(133272455163688424, '培训主管', 10017, '负责员工培训工作', '2024-01-20 09:30:00'),
(133272455163688425, '质检主管', 10018, '负责服务质量检查', '2024-01-20 11:15:00'),
(133272455163688426, '投诉处理员', 10019, '负责投诉处理工作', '2024-01-20 14:30:00');

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
(5, '郑客服', 'service003', '客服专员', '13800138010'),
(6, '陈经理', 'manager006', '物业管理员', '13800138024'),
(7, '王主管', 'security003', '安保主管', '13800138025'),
(8, '李客服', 'service004', '客服专员', '13800138026'),
(9, '张经理', 'manager007', '物业管理员', '13800138027'),
(10, '赵主管', 'security004', '安保主管', '13800138028'),
(11, '钱客服', 'service005', '客服专员', '13800138029'),
(12, '孙经理', 'manager008', '物业管理员', '13800138030'),
(13, '周主管', 'security005', '安保主管', '13800138031'),
(14, '吴客服', 'service006', '客服专员', '13800138032'),
(15, '郑经理', 'manager009', '物业管理员', '13800138033');

CREATE TABLE door_machine_device (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '设备ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    house_id INT NOT NULL COMMENT '关联的房屋ID',
    device_name VARCHAR(100) NOT NULL COMMENT '设备名称',
    device_code VARCHAR(50) NOT NULL COMMENT '设备编号',
    ip_address VARCHAR(50) NOT NULL COMMENT 'IP地址',
    community_code VARCHAR(50) NOT NULL COMMENT '小区编码',
    device_status TINYINT DEFAULT 1 COMMENT '设备状态：0-离线 1-在线',
    face_download_time DATETIME COMMENT '人脸下载时间',
    version_number VARCHAR(50) COMMENT '版本号',
    config_version VARCHAR(50) COMMENT '配置表版本',
    mac_address VARCHAR(50) COMMENT 'MAC地址',
    last_heartbeat_time DATETIME COMMENT '最后心跳时间',
    online_duration INT DEFAULT 0 COMMENT '在线时长(分钟)',
    hardware_version VARCHAR(50) COMMENT '硬件版本号',
    software_version VARCHAR(50) COMMENT '软件版本号',
    device_type ENUM('entrance', 'unit', 'fence') COMMENT '设备类型:entrance-门口机,unit-单元机,fence-围墙机',
    remark TEXT COMMENT '备注信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id),
    UNIQUE KEY `uk_device_code` (`device_code`),
    UNIQUE KEY `uk_ip_address` (`ip_address`)
) COMMENT '门口机设备表';

-- 插入示例数据
INSERT INTO door_machine_device
(community_id, house_id, device_name, device_code, ip_address, community_code, 
device_status, face_download_time, version_number, device_type, created_at)
VALUES
-- 阳光花园的设备
(1, 4, '1区1栋1单元1号单元门口机', '200111', '192.168.1.2', 'CN001', 1, '2024-02-25 10:30:00', '7.32.0435.1353', 'entrance', '2024-02-25 08:00:00'),
(1, 5, '2区1栋1单元围墙机', '200112', '192.168.1.3', 'CN001', 1, '2024-02-25 11:30:00', '7.32.0435.1353', 'fence', '2024-02-25 09:00:00'),
(1, 6, '5区42栋12单元门口机', '200113', '192.168.1.4', 'CN001', 0, '2024-02-25 12:30:00', '7.32.0435.1353', 'entrance', '2024-02-25 10:00:00'),

-- 翡翠湾的设备
(2, 7, '1号楼大门口机', '200114', '192.168.1.5', 'CN002', 1, '2024-02-26 10:30:00', '7.32.0435.1353', 'entrance', '2024-02-26 08:00:00'),
(2, 8, '2号楼单元机', '200115', '192.168.1.6', 'CN002', 0, '2024-02-26 11:30:00', '7.32.0435.1353', 'unit', '2024-02-26 09:00:00'),

-- 康庄小区的设备
(3, 9, '东门围墙机', '200116', '192.168.1.7', 'CN003', 1, '2024-02-27 10:30:00', '7.32.0435.1353', 'fence', '2024-02-27 08:00:00'),
(3, 10, '西门围墙机', '200117', '192.168.1.8', 'CN003', 1, '2024-02-27 11:30:00', '7.32.0435.1353', 'fence', '2024-02-27 09:00:00'),

-- 龙湖苑的设备
(4, 11, '1号门口机', '200118', '192.168.1.9', 'CN004', 0, '2024-02-28 10:30:00', '7.32.0435.1353', 'entrance', '2024-02-28 08:00:00'),
(4, 12, '2号单元机', '200119', '192.168.1.10', 'CN004', 1, '2024-02-28 11:30:00', '7.32.0435.1353', 'unit', '2024-02-28 09:00:00'),

-- 海风小区的设备
(5, 13, '主门口机', '200120', '192.168.1.11', 'CN005', 1, '2024-02-29 10:30:00', '7.32.0435.1353', 'entrance', '2024-02-29 08:00:00'),
(5, 14, '侧门围墙机', '200121', '192.168.1.12', 'CN005', 0, '2024-02-29 11:30:00', '7.32.0435.1353', 'fence', '2024-02-29 09:00:00');

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
(community_id, name, phone_number, remark, face_status, updated_at)
VALUES
-- 崔庆科技小区的物业管理员
(1, '谢', '13711487267', NULL, 1, '2024-06-08 11:40:49'),
(1, '测试用', '13542406093', NULL, 1, '2025-01-25 14:56:28'),

-- 其他小区的物业管理员
(2, '王', '13800138001', '保洁主管', 1, '2024-01-15 09:30:00'),
(2, '李', '13800138002', '维修组长', 1, '2024-01-15 10:20:00'),
(3, '张', '13800138003', '园艺主管', 1, '2024-01-16 08:45:00'),
(4, '刘', '13800138004', '设备维护', 1, '2024-01-16 14:30:00'),
(5, '赵', '13800138005', '保安队长', 1, '2024-01-17 11:20:00'),
(1, '张维修', '13800138011', '电工主管', 1, NOW()),
(1, '李保洁', '13800138012', '保洁组长', 1, NOW()),
(2, '王安保', '13800138013', '保安队长', 1, NOW()),
(2, '赵园艺', '13800138014', '绿化主管', 0, NOW()),
(3, '钱维护', '13800138015', '设备维护', 1, NOW()),
(3, '孙客服', '13800138016', '客服主管', 1, NOW()),
(4, '周工程', '13800138017', '工程部长', 0, NOW()),
(4, '吴管家', '13800138018', '管家服务', 1, NOW()),
(5, '郑维修', '13800138019', '维修主管', 1, NOW()),
(5, '冯保洁', '13800138020', '保洁主管', 0, NOW()),
(1, '陈安保', '13800138021', '保安组长', 1, NOW()),
(2, '楚园艺', '13800138022', '园艺师', 1, NOW()),
(3, '魏维护', '13800138023', '设备组长', 0, NOW());

-- 创建业主信息表
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
    account VARCHAR(50) UNIQUE COMMENT '账号',
    password VARCHAR(100) COMMENT '密码',
    wx_openid VARCHAR(50) UNIQUE COMMENT '微信openid',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
(community_id, house_id, name, gender, phone_number, id_card, email, city, address, owner_type, face_status, updated_at, account, password, wx_openid)
VALUES
-- 阳光花园的业主
(1, 4, '王建国', 1, '13800001001', '110101199001011234', 'wangjg@example.com', '北京', '朝阳区', '业主', 1, NOW(), 'owner001', 'pwd123', 'wx001'),
(1, 5, '李小华', 2, '13800001002', '110101199002022345', 'lixh@example.com', '北京', '海淀区', '业主', 1, NOW(), 'owner002', 'pwd123', 'wx002'),
(2, 7, '张明', 1, '13800001003', '110101199003033456', 'zhangm@example.com', '上海', '浦东新区', '业主', 0, NOW(), 'owner003', 'pwd123', 'wx003'),
(2, 8, '刘芳', 2, '13800001004', '110101199004044567', 'liuf@example.com', '上海', '徐汇区', '业主', 1, NOW(), 'owner004', 'pwd123', 'wx004'),
(3, 9, '陈强', 1, '13800001005', '110101199005055678', 'chenq@example.com', '广州', '天河区', '业主', 1, NOW(), 'owner005', 'pwd123', 'wx005'),
(3, 10, '赵婷', 2, '13800001006', '110101199006066789', 'zhaot@example.com', '广州', '越秀区', '业主', 0, NOW(), 'owner006', 'pwd123', 'wx006'),
(4, 11, '孙伟', 1, '13800001007', '110101199007077890', 'sunw@example.com', '深圳', '南山区', '业主', 1, NOW(), 'owner007', 'pwd123', 'wx007'),
(4, 12, '周丽', 2, '13800001008', '110101199008088901', 'zhoul@example.com', '深圳', '福田区', '业主', 1, NOW(), 'owner008', 'pwd123', 'wx008'),
(5, 13, '吴刚', 1, '13800001009', '110101199009099012', 'wug@example.com', '成都', '武侯区', '业主', 0, NOW(), 'owner009', 'pwd123', 'wx009'),
(5, 14, '郑萍', 2, '13800001010', '110101199010100123', 'zhengp@example.com', '成都', '锦江区', '业主', 1, NOW(), 'owner010', 'pwd123', 'wx010'),
(1, 15, '黄磊', 1, '13800001011', '110101199011111234', 'huangl@example.com', '北京', '西城区', '业主', 1, NOW(), 'owner011', 'pwd123', 'wx011'),
(2, 16, '马云', 2, '13800001012', '110101199012122345', 'may@example.com', '上海', '静安区', '业主', 0, NOW(), 'owner012', 'pwd123', 'wx012'),
(3, 17, '韩雪', 2, '13800001013', '110101199101133456', 'hanx@example.com', '广州', '海珠区', '业主', 1, NOW(), 'owner013', 'pwd123', 'wx013'),
(4, 18, '朱峰', 1, '13800001014', '110101199102144567', 'zhuf@example.com', '深圳', '罗湖区', '业主', 1, NOW(), 'owner014', 'pwd123', 'wx014'),
(6, 19, '陈建军', 1, '13800001015', '110101199103155678', 'chenjj@example.com', '重庆', '渝中区', '业主', 1, NOW(), 'owner015', 'pwd123', 'wx015'),
(7, 20, '杨丽娜', 2, '13800001016', '110101199104166789', 'yangln@example.com', '武汉', '江汉区', '业主', 0, NOW(), 'owner016', 'pwd123', 'wx016'),
(8, 21, '王志强', 1, '13800001017', '110101199105177890', 'wangzq@example.com', '成都', '青羊区', '业主', 1, NOW(), 'owner017', 'pwd123', 'wx017'),
(9, 22, '林美玲', 2, '13800001018', '110101199106188901', 'linml@example.com', '南京', '鼓楼区', '业主', 1, NOW(), 'owner018', 'pwd123', 'wx018'),
(10, 23, '张伟业', 1, '13800001019', '110101199107199012', 'zhangwy@example.com', '杭州', '西湖区', '业主', 0, NOW(), 'owner019', 'pwd123', 'wx019'),
(11, 24, '刘晓燕', 2, '13800001020', '110101199108200123', 'liuxy@example.com', '苏州', '姑苏区', '业主', 1, NOW(), 'owner020', 'pwd123', 'wx020');

-- 插入业主权限数据
INSERT INTO owner_permission
(owner_id, house_id, permission_status, valid_period, calling_enabled, pstn_enabled, updated_at)
SELECT 
    id as owner_id,
    house_id,
    '正常' as permission_status,
    '永久有效' as valid_period,
    1 as calling_enabled,
    FLOOR(RAND() * 2) as pstn_enabled,
    NOW() as updated_at
FROM owner_info
WHERE id > 6;  -- 从新增的业主开始添加权限

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
(@community_id_2, NULL, '停电通知', '明日小区停电维护，请提前做好准备', '2025-03-01', '2025-03-01', '2024-08-05 09:00:00'),
(2, 7, '水费催缴通知', '您的水费已逾期，请及时缴纳', '2024-08-15', '2024-08-22', NOW()),
(2, 8, '装修申请通过', '您的装修申请已审核通过', '2024-08-16', '2024-08-23', NOW()),
(3, 9, '噪音投诉提醒', '收到邻居投诉，请注意装修时间', '2024-08-17', '2024-08-24', NOW()),
(3, 10, '车位使用提醒', '您的车位使用即将到期', '2024-08-18', '2024-08-25', NOW()),
(4, 11, '访客预约通知', '您有访客预约待确认', '2024-08-19', '2024-08-26', NOW()),
(4, 12, '快递到达通知', '您有快递待领取', '2024-08-20', '2024-08-27', NOW()),
(5, 13, '维修完成通知', '您申请的维修工作已完成', '2024-08-21', '2024-08-28', NOW()),
(5, 14, '物业费结算单', '本月物业费用明细', '2024-08-22', '2024-08-29', NOW());

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
DROP TABLE IF EXISTS call_record;
CREATE TABLE call_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    community_id INT NOT NULL COMMENT '关联的小区ID',
    house_id INT NOT NULL COMMENT '关联的房屋ID',
    owner_id BIGINT NOT NULL COMMENT '业主ID',
    door_access_info VARCHAR(200) COMMENT '门禁信息描述',
    call_start_time DATETIME NOT NULL COMMENT '呼叫开始时间',
    call_duration INT UNSIGNED COMMENT '呼叫时长，单位秒',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '呼叫记录表';

-- 先确认已存在的房屋数据
SELECT * FROM house_info;

-- 重新插入呼叫记录的示例数据
INSERT INTO call_record
(community_id, house_id, owner_id, door_access_info, call_start_time, call_duration)
VALUES
-- 阳光花园的呼叫记录
(1, 4, 1, '1区1栋1单元门口机', '2024-08-08 10:15:30', 35),
(1, 5, 2, '2区1栋1单元门口机', '2024-08-08 14:20:00', 58),
(1, 6, 3, '5区42栋12单元门口机', '2024-08-09 09:00:10', 120),
-- 更多示例数据
(1, 4, 4, '1区1栋1单元门口机', '2024-08-10 08:30:00', 45),
(1, 4, 5, '1区1栋1单元门口机', '2024-08-10 15:20:00', 25),
(1, 5, 6, '2区1栋1单元门口机', '2024-08-11 11:10:00', 90),
(1, 6, 7, '5区42栋12单元门口机', '2024-08-12 16:45:00', 60),
-- 翡翠湾的呼叫记录（需要先确认翡翠湾的房屋ID）
(2, 7, 8, '1区1栋1单元门口机', '2024-08-09 10:30:00', 40),
(2, 7, 9, '1区1栋1单元门口机', '2024-08-10 14:15:00', 55),
(2, 8, 10, '2区1栋2单元门口机', '2024-08-11 09:20:00', 70),
-- 康庄小区的呼叫记录（需要先确认康庄小区的房屋ID）
(3, 8, 11, '1区2栋1单元门口机', '2024-08-12 11:30:00', 65),
(3, 9, 12, '2区1栋3单元门口机', '2024-08-13 16:40:00', 80);

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
(2, 8, '医疗紧急', '2024-08-13 20:10:00', '2024-08-13 20:10:00', '老人跌倒报警', 'Processing'),
(3, 9, '盗警', '2024-08-14 03:20:00', '2024-08-14 03:25:00', '阳台移动感应器触发', 'Resolved'),
(3, 10, '医疗紧急', '2024-08-15 07:30:00', '2024-08-15 07:30:00', '紧急求助按钮触发', 'Processing'),
(4, 11, '火警', '2024-08-16 12:15:00', '2024-08-16 12:20:00', '客厅烟感器报警', 'Resolved'),
(4, 12, '盗警', '2024-08-17 23:40:00', '2024-08-17 23:45:00', '门禁异常开启报警', 'Pending'),
(5, 13, '医疗紧急', '2024-08-18 05:10:00', '2024-08-18 05:10:00', '卫生间紧急呼叫', 'Processing'),
(5, 14, '火警', '2024-08-19 18:25:00', '2024-08-19 18:30:00', '厨房燃气报警器触发', 'Resolved');

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
(1, 4, 'Entrance Machine', '1号楼大门', '密码开锁', '王建国', NOW() - INTERVAL 1 DAY),
(1, 5, 'Fencing Machine', '小区东门', '刷卡开锁', '李小华', NOW() - INTERVAL 2 DAY),
(2, 7, 'Entrance Machine', '2号楼大门', 'APP开锁', '张明', NOW() - INTERVAL 3 DAY),
(2, 8, 'Other', '车库门', '钥匙开锁', '刘芳', NOW() - INTERVAL 4 DAY),
(3, 9, 'Entrance Machine', '3号楼大门', '人脸识别', '陈强', NOW() - INTERVAL 5 DAY),
(3, 10, 'Fencing Machine', '小区西门', '刷卡开锁', '赵婷', NOW() - INTERVAL 6 DAY),
(4, 11, 'Entrance Machine', '4号楼大门', 'APP开锁', '孙伟', NOW() - INTERVAL 7 DAY),
(4, 12, 'Other', '会所大门', '密码开锁', '周丽', NOW() - INTERVAL 8 DAY),
(5, 13, 'Entrance Machine', '5号楼大门', '人脸识别', '吴刚', NOW() - INTERVAL 9 DAY),
(5, 14, 'Fencing Machine', '小区南门', '刷卡开锁', '郑萍', NOW() - INTERVAL 10 DAY),
(1, 15, 'Entrance Machine', '6号楼大门', 'APP开锁', '黄磊', NOW() - INTERVAL 11 DAY),
(2, 16, 'Other', '健身房门', '密码开锁', '马云', NOW() - INTERVAL 12 DAY),
(3, 17, 'Entrance Machine', '7号楼大门', '人脸识别', '韩雪', NOW() - INTERVAL 13 DAY),
(4, 18, 'Fencing Machine', '小区北门', '刷卡开锁', '朱峰', NOW() - INTERVAL 14 DAY);

-- 验证插入结果
SELECT 
    ur.*,
    ci.community_name,
    hi.house_full_name
FROM unlocking_record ur
JOIN community_info ci ON ur.community_id = ci.id
JOIN house_info hi ON ur.house_id = hi.id
ORDER BY ur.unlocking_time;

-- 创建个人信息表
CREATE TABLE personal_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    account_number VARCHAR(50) UNIQUE NOT NULL COMMENT '账号',
    nickname VARCHAR(50) COMMENT '别名/昵称',
    phone_number VARCHAR(20) UNIQUE COMMENT '手机号码',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    profile_picture_path VARCHAR(200) COMMENT '头像路径',
    password VARCHAR(50) NOT NULL COMMENT '密码',
    wx_openid VARCHAR(50) UNIQUE COMMENT '微信openid',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '个人信息表';

INSERT INTO personal_info 
(account_number, nickname, phone_number, email, profile_picture_path, password, created_at)
VALUES
('user001', '小明', '13800000001', 'xiaoming@example.com', '/images/xiaoming.jpg', '123456', NOW()),
('user002', '小红', '13800000002', 'xiaohong@example.com', '/images/xiaohong.jpg', '123456', NOW()),
('user003', '小刚', '13800000003', 'xiaogang@example.com', '/images/xiaogang.jpg', '123456', NOW()),
('user004', '小丽', '13800000004', 'xiaoli@example.com', '/images/xiaoli.jpg', '123456', NOW()),
('user005', '小强', '13800000005', 'xiaoqiang@example.com', '/images/xiaoqiang.jpg', '123456', NOW()),
('user006', '张伟', '13800000006', 'zhangwei@example.com', '/images/zhangwei.jpg', '123456', NOW()),
('user007', '李娜', '13800000007', 'lina@example.com', '/images/lina.jpg', '123456', NOW()),
('user008', '王芳', '13800000008', 'wangfang@example.com', '/images/wangfang.jpg', '123456', NOW()),
('user009', '刘洋', '13800000009', 'liuyang@example.com', '/images/liuyang.jpg', '123456', NOW()),
('user010', '陈静', '13800000010', 'chenjing@example.com', '/images/chenjing.jpg', '123456', NOW()),
('user011', '赵鑫', '13800000011', 'zhaoxin@example.com', '/images/zhaoxin.jpg', '123456', NOW()),
('user012', '孙明', '13800000012', 'sunming@example.com', '/images/sunming.jpg', '123456', NOW()),
('user013', '周红', '13800000013', 'zhouhong@example.com', '/images/zhouhong.jpg', '123456', NOW()),
('user014', '吴军', '13800000014', 'wujun@example.com', '/images/wujun.jpg', '123456', NOW()),
('user015', '郑华', '13800000015', 'zhenghua@example.com', '/images/zhenghua.jpg', '123456', NOW()),
('user016', '马超', '13800000016', 'machao@example.com', '/images/machao.jpg', '123456', NOW()),
('user017', '胡敏', '13800000017', 'humin@example.com', '/images/humin.jpg', '123456', NOW()),
('user018', '朱峰', '13800000018', 'zhufeng@example.com', '/images/zhufeng.jpg', '123456', NOW()),
('user019', '杨勇', '13800000019', 'yangyong@example.com', '/images/yangyong.jpg', '123456', NOW()),
('user020', '林萍', '13800000020', 'linping@example.com', '/images/linping.jpg', '123456', NOW());

-- 查询个人信息表数据，验证插入是否成功
SELECT * FROM personal_info;

INSERT INTO community_notification
(community_id, title, content, display_start_time, display_end_time, created_at)
VALUES
(2, '小区环境整治通知', '为提升小区环境，将于本周六进行绿化修剪', '2024-08-15', '2024-08-20', NOW()),
(2, '电梯维护公告', '1号楼电梯将于明日进行例行维护', '2024-08-16', '2024-08-17', NOW()),
(3, '业主大会通知', '关于召开2024年第一次业主大会的通知', '2024-08-20', '2024-08-25', NOW()),
(3, '停车场管理规定', '关于加强小区停车场管理的通知', '2024-08-21', '2024-08-28', NOW()),
(4, '安全防范提示', '近期天气炎热，请注意防火安全', '2024-08-22', '2024-08-29', NOW()),
(4, '物业费缴纳通知', '2024年度物业费缴纳通知', '2024-08-23', '2024-09-23', NOW()),
(5, '文明养犬公约', '关于规范小区养犬行为的通知', '2024-08-24', '2024-09-24', NOW()),
(5, '节水倡议书', '珍惜水资源，从我做起', '2024-08-25', '2024-09-25', NOW());

INSERT INTO door_machine_content_management
(community_id, screen_orientation, content_type, content_path, display_start_time, display_end_time, is_enabled, sort_order)
VALUES
(4, 'Landscape', '社区公告', '/images/notice2.jpg', '2024-09-05 08:00:00', '2024-10-05 20:00:00', 1, 7),
(4, 'Vertical', '节日祝福', '/images/festival.jpg', '2024-09-10 09:00:00', '2024-10-10 21:00:00', 1, 8),
(5, 'Landscape', '安全提示', '/videos/safety_tips.mp4', '2024-09-15 08:00:00', '2024-10-15 20:00:00', 1, 9),
(5, 'Vertical', '物业通知', '/images/property_notice.jpg', '2024-09-20 09:00:00', '2024-10-20 21:00:00', 1, 10),
(6, 'Landscape', '社区活动', '/videos/community_event.mp4', '2024-09-25 08:00:00', '2024-10-25 20:00:00', 1, 11),
(6, 'Vertical', '便民服务', '/images/service_info.jpg', '2024-09-30 09:00:00', '2024-10-30 21:00:00', 1, 12);

-- 创建门口机设备日志表
CREATE TABLE door_machine_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    device_id BIGINT NOT NULL COMMENT '关联的设备ID',
    log_type VARCHAR(50) NOT NULL COMMENT '日志类型',
    log_content TEXT NOT NULL COMMENT '日志内容',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (device_id) REFERENCES door_machine_device(id)
) COMMENT '门口机设备日志表';

-- 创建门口机设备配置表
CREATE TABLE door_machine_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    device_id BIGINT NOT NULL COMMENT '关联的设备ID',
    config_key VARCHAR(50) NOT NULL COMMENT '配置项键名',
    config_value TEXT COMMENT '配置项值',
    config_description VARCHAR(200) COMMENT '配置说明',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (device_id) REFERENCES door_machine_device(id),
    UNIQUE KEY `uk_device_config` (`device_id`, `config_key`)
) COMMENT '门口机设备配置表';

-- 创建设备心跳记录表
CREATE TABLE door_machine_heartbeat (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    device_id BIGINT NOT NULL COMMENT '关联的设备ID',
    heartbeat_time DATETIME NOT NULL COMMENT '心跳时间',
    device_status TINYINT COMMENT '设备状态',
    software_version VARCHAR(50) COMMENT '软件版本',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES door_machine_device(id)
) COMMENT '设备心跳记录表';

-- 访客邀请记录表
CREATE TABLE visitor_invitation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '访客邀请ID',
    community_id INT NOT NULL COMMENT '小区ID',
    house_id INT NOT NULL COMMENT '房屋ID',
    owner_id BIGINT NOT NULL COMMENT '业主ID',
    visitor_name VARCHAR(50) NOT NULL COMMENT '访客姓名',
    visitor_phone VARCHAR(20) COMMENT '访客电话',
    visitor_code VARCHAR(10) NOT NULL COMMENT '访客码',
    remark VARCHAR(200) COMMENT '备注信息',
    visit_date DATE NOT NULL COMMENT '来访日期',
    visit_time TIME NOT NULL COMMENT '来访时间',
    status TINYINT DEFAULT 0 COMMENT '状态：0-未使用 1-已使用 2-已过期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    used_at DATETIME COMMENT '使用时间',
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id),
    FOREIGN KEY (owner_id) REFERENCES owner_info(id)
) COMMENT '访客邀请记录表';

-- 插入访客邀请记录测试数据
INSERT INTO visitor_invitation 
(community_id, house_id, owner_id, visitor_name, visitor_phone, visitor_code, remark, visit_date, visit_time, status, created_at, used_at)
VALUES
-- 王建国的访客记录
(1, 4, 1, '张三', '13800138001', '1234', '朋友来访', '2024-03-20', '14:30:00', 1, '2024-03-19 10:00:00', '2024-03-20 14:35:00'),
(1, 4, 1, '李四', '13800138002', '5678', '送快递', '2024-03-21', '15:00:00', 0, '2024-03-19 11:00:00', NULL),
(1, 4, 1, '王五', '13800138003', '9012', '亲戚来访', '2024-03-18', '09:00:00', 2, '2024-03-17 16:00:00', NULL),

-- 李小华的访客记录
(1, 5, 2, '赵六', '13800138004', '3456', '维修水管', '2024-03-20', '16:00:00', 1, '2024-03-19 14:00:00', '2024-03-20 16:05:00'),
(1, 5, 2, '孙七', '13800138005', '7890', '送家具', '2024-03-22', '10:00:00', 0, '2024-03-19 15:00:00', NULL),

-- 张明的访客记录
(2, 7, 3, '周八', '13800138006', '2345', '同事来访', '2024-03-21', '11:00:00', 0, '2024-03-20 09:00:00', NULL),
(2, 7, 3, '吴九', '13800138007', '6789', '朋友聚会', '2024-03-19', '13:00:00', 2, '2024-03-18 10:00:00', NULL),

-- 刘芳的访客记录
(2, 8, 4, '郑十', '13800138008', '0123', '家教老师', '2024-03-20', '15:30:00', 1, '2024-03-19 16:00:00', '2024-03-20 15:35:00'),

-- 陈强的访客记录
(3, 9, 5, '钱一', '13800138009', '4567', '装修工人', '2024-03-22', '09:30:00', 0, '2024-03-20 11:00:00', NULL),
(3, 9, 5, '孙二', '13800138010', '8901', '送餐', '2024-03-20', '10:00:00', 1, '2024-03-19 09:00:00', '2024-03-20 10:05:00'),

-- 赵婷的访客记录
(3, 10, 6, '周三', '13800138011', '2468', '亲戚来访', '2024-03-21', '14:00:00', 0, '2024-03-20 10:00:00', NULL),
(3, 10, 6, '吴四', '13800138012', '1357', '朋友聚会', '2024-03-19', '16:30:00', 2, '2024-03-18 15:00:00', NULL);


-- 更新现有记录的小区编码
UPDATE door_machine_device d
JOIN community_info c ON d.community_id = c.id
SET d.community_code = c.community_number;

-- 查询示例（用于验证数据）
SELECT 
    d.device_code as '设备编号',
    d.device_name as '设备名称',
    c.community_name as '所属小区',
    d.community_code as '小区编码',
    d.ip_address as 'IP',
    d.created_at as '创建时间',
    CASE d.device_status 
        WHEN 1 THEN '在线'
        ELSE '离线'
    END as '最新设备状态',
    d.face_download_time as '人脸下载时间'
FROM door_machine_device d
JOIN community_info c ON d.community_id = c.id
ORDER BY d.created_at DESC;


-- 先删除外键约束
ALTER TABLE community_notification 
DROP FOREIGN KEY community_notification_ibfk_1;

-- 先在community_info表中添加ID为0的记录
INSERT INTO community_info
(id, community_number, community_name, community_city, creation_time, is_enabled,
management_machine_quantity, indoor_machine_quantity, access_card_type,
app_record_face, is_same_step, is_record_upload, community_password)
VALUES
(0, 'GLOBAL', '全局通知', '全国', '2024-01-01 00:00:00', 1, 0, 0, 'NONE', 0, 0, 0, 'global_pwd');

-- 为社区ID为1的小区添加通知数据
INSERT INTO community_notification
(community_id, title, content, display_start_time, display_end_time, created_at)
VALUES
-- 社区ID为1的通知
(1, '物业费缴纳通知', '尊敬的业主，2025年第一季度物业费将于3月31日前缴纳，请及时处理。', '2025-03-01', '2025-03-31', NOW()),
(1, '小区环境整治通知', '为提升小区环境，将于本周六进行绿化修剪和公共区域清洁，请业主配合工作。', '2025-03-10', '2025-03-20', NOW()),
(1, '电梯维修通知', '1号楼电梯将于3月15日进行维修，维修时间为上午9:00-12:00，请业主提前安排出行。', '2025-03-12', '2025-03-16', NOW()),
(1, '业主大会通知', '关于召开2025年第一次业主大会的通知，时间：3月20日晚7点，地点：小区会议室。', '2025-03-15', '2025-03-20', NOW()),
(1, '安全防范提示', '近期天气多变，请注意防火防盗安全，外出时请关好门窗。', '2025-03-05', '2025-04-05', NOW()),
(1, '停车场管理规定', '关于加强小区停车场管理的通知，非本小区车辆禁止入内。', '2025-03-08', '2025-04-08', NOW()),
(1, '文明养犬公约', '请遵守文明养犬规定，遛狗时牵好狗绳，及时清理宠物粪便。', '2025-03-10', '2025-04-10', NOW()),
(1, '节水节电倡议', '珍惜资源，从我做起，请业主们节约用水用电。', '2025-03-12', '2025-04-12', NOW()),
(1, '小区监控系统升级通知', '小区监控系统将于3月18日进行升级，期间可能会有短暂中断。', '2025-03-16', '2025-03-19', NOW()),
(1, '社区活动通知', '3月25日将举办"邻里和谐"主题活动，欢迎各位业主参加。', '2025-03-20', '2025-03-25', NOW()),
-- 全局通知(community_id=0)
(0, '系统维护通知', '尊敬的用户，系统将于3月30日凌晨2:00-4:00进行维护升级，期间可能无法正常使用。', '2025-03-25', '2025-03-31', NOW()),
(0, '新功能上线公告', '智慧社区App新增访客邀请、一键报修等功能，欢迎体验。', '2025-03-01', '2025-04-01', NOW());

-- 为其他社区添加一些通知
INSERT INTO community_notification
(community_id, title, content, display_start_time, display_end_time, created_at)
VALUES
(2, '翡翠湾物业通知', '关于调整物业服务内容的通知', '2025-03-05', '2025-04-05', NOW()),
(3, '康庄小区安全通知', '小区将进行消防演习，请各位业主配合', '2025-03-10', '2025-03-20', NOW()),
(4, '龙湖苑装修规定', '请遵守小区装修管理规定，避免噪音扰民', '2025-03-15', '2025-04-15', NOW()),
(5, '海风小区业主活动', '本周日举办业主联谊活动，地点：小区中心广场', '2025-03-20', '2025-03-25', NOW());

-- 创建社区评价表
CREATE TABLE community_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    community_id INT NOT NULL COMMENT '关联的小区ID',
    user_id INT NOT NULL COMMENT '用户ID',
    rating INT NOT NULL COMMENT '评分（1-5星）',
    comment TEXT COMMENT '评价内容',
    images TEXT COMMENT '图片路径，多个路径用逗号分隔',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    reply TEXT COMMENT '物业回复内容',
    reply_time DATETIME COMMENT '回复时间',
    status TINYINT DEFAULT 0 COMMENT '状态：0-未回复 1-已回复',
    FOREIGN KEY (community_id) REFERENCES community_info(id)
);

-- 插入社区评价示例数据
INSERT INTO community_reviews 
(community_id, user_id, rating, comment, images, created_at, reply, reply_time, status)
VALUES
-- 阳光花园的评价
(1, 1, 5, '小区环境非常好，绿化做得很棒，物业服务也很及时。', 'https://example.com/images/review1_1.jpg,https://example.com/images/review1_2.jpg', '2024-05-10 09:30:00', '感谢您的好评，我们会继续努力提供更好的服务！', '2024-05-10 14:20:00', 1),
(1, 2, 4, '物业人员态度很好，但是小区健身设施有些老旧了，希望能更新一下。', 'https://example.com/images/review2_1.jpg', '2024-05-09 15:45:00', '感谢您的建议，我们已经计划在下个月更新健身设施。', '2024-05-09 17:30:00', 1),
(1, 3, 3, '小区安全性不错，但是停车位太少了，经常找不到车位。', '', '2024-05-08 18:20:00', '您好，我们正在规划增加地下停车位，预计年底完成。', '2024-05-09 09:15:00', 1),
(1, 4, 5, '搬来这个小区半年了，非常满意，特别是物业的响应速度很快。', 'https://example.com/images/review4_1.jpg,https://example.com/images/review4_2.jpg,https://example.com/images/review4_3.jpg', '2024-05-07 10:10:00', '谢谢您的认可，我们会保持高质量的服务水平！', '2024-05-07 13:40:00', 1),

-- 翡翠湾的评价
(2, 5, 2, '小区垃圾分类做得不好，希望物业加强管理。', 'https://example.com/images/review5_1.jpg', '2024-05-10 08:15:00', '非常抱歉，我们会立即改进垃圾分类管理，并加强宣传教育。', '2024-05-10 11:30:00', 1),
(2, 6, 4, '小区的花园很漂亮，每天早晨在这里散步很舒服。', 'https://example.com/images/review6_1.jpg,https://example.com/images/review6_2.jpg', '2024-05-09 16:50:00', '谢谢您的好评，我们会继续保持花园的美观。', '2024-05-10 09:20:00', 1),
(2, 7, 3, '物业服务一般，有时候报修要等很久才处理。', '', '2024-05-08 14:30:00', '对于您反映的问题，我们深表歉意，已经调整了报修流程，提高处理效率。', '2024-05-09 10:45:00', 1),

-- 康庄小区的评价
(3, 8, 5, '小区的安保系统非常好，感觉很安全。', 'https://example.com/images/review8_1.jpg', '2024-05-10 11:20:00', '安全是我们的首要任务，感谢您的认可！', '2024-05-10 15:10:00', 1),
(3, 9, 4, '物业人员很热情，小区环境也很干净。', '', '2024-05-09 09:40:00', '谢谢您的好评，我们会继续保持良好的服务和环境。', '2024-05-09 14:25:00', 1),
(3, 10, 2, '楼道灯经常不亮，已经反映多次但没有彻底解决。', 'https://example.com/images/review10_1.jpg', '2024-05-08 19:15:00', '非常抱歉，我们已安排专人检修所有楼道灯，确保问题不再发生。', '2024-05-09 08:50:00', 1),

-- 龙湖苑的评价
(4, 11, 5, '小区的儿童游乐设施很完善，孩子很喜欢。', 'https://example.com/images/review11_1.jpg,https://example.com/images/review11_2.jpg', '2024-05-10 10:30:00', '很高兴您的孩子喜欢我们的游乐设施，我们会定期维护确保安全。', '2024-05-10 16:20:00', 1),
(4, 12, 3, '物业费有点贵，希望能提供更多增值服务。', '', '2024-05-09 13:25:00', '感谢您的建议，我们正在规划增加更多社区服务项目。', '2024-05-10 08:40:00', 1),

-- 海风小区的评价
(5, 13, 4, '小区的绿化做得很好，空气清新。', 'https://example.com/images/review13_1.jpg', '2024-05-10 14:15:00', '谢谢您的好评，我们会继续保持良好的绿化环境。', '2024-05-11 09:30:00', 1),
(5, 14, 5, '物业服务非常专业，有问题处理得很及时。', '', '2024-05-09 11:50:00', '感谢您的认可，我们将继续提供高质量的物业服务。', '2024-05-09 16:40:00', 1),
(5, 15, 2, '小区的公共设施维护不及时，健身器材有些已经损坏。', 'https://example.com/images/review15_1.jpg,https://example.com/images/review15_2.jpg', '2024-05-08 16:35:00', '非常抱歉，我们已安排维修人员检修所有健身器材，预计三天内完成。', '2024-05-09 10:20:00', 1),

-- 金色家园的评价
(6, 16, 4, '小区的电梯维护得很好，从不出故障。', '', '2024-05-10 09:45:00', '谢谢您的好评，我们会继续做好设备维护工作。', '2024-05-10 14:30:00', 1),
(6, 17, 3, '小区大门的门禁系统有时候会失灵，希望能改进。', 'https://example.com/images/review17_1.jpg', '2024-05-09 17:20:00', '感谢您的反馈，我们已联系厂商升级门禁系统。', '2024-05-10 10:15:00', 1),

-- 未回复的评价
(1, 18, 4, '小区的公共区域很干净，但是希望能增加一些休闲座椅。', 'https://example.com/images/review18_1.jpg', '2024-05-11 10:25:00', NULL, NULL, 0),
(2, 19, 3, '物业服务态度还可以，但是效率有待提高。', '', '2024-05-11 11:40:00', NULL, NULL, 0),
(3, 20, 5, '搬来这个小区是正确的选择，环境和服务都很满意。', 'https://example.com/images/review20_1.jpg,https://example.com/images/review20_2.jpg', '2024-05-11 13:15:00', NULL, NULL, 0),
(4, 1, 2, '小区的噪音问题比较严重，特别是晚上。', '', '2024-05-11 15:30:00', NULL, NULL, 0),
(5, 2, 4, '物业人员很负责，小区环境也很好。', 'https://example.com/images/review22_1.jpg', '2024-05-11 16:45:00', NULL, NULL, 0),
(6, 3, 3, '小区的安全措施还可以，但监控系统覆盖不够全面。', '', '2024-05-11 18:20:00', NULL, NULL, 0);

-- 创建报事报修表
CREATE TABLE IF NOT EXISTS maintenance_request (
    -- 基本信息
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '报修ID',
    request_code VARCHAR(12) NOT NULL COMMENT '报修随机码，用于无需登录查询报修进度',
    request_number VARCHAR(50) NOT NULL COMMENT '报修单号',
    
    -- 位置信息（外键关联）
    community_id INT NOT NULL COMMENT '社区ID',
    house_id INT NOT NULL COMMENT '房屋ID',
    
    -- 报修人信息
    reporter_name VARCHAR(50) NOT NULL COMMENT '报修人姓名',
    reporter_phone VARCHAR(20) NOT NULL COMMENT '报修人电话',
    
    -- 报修内容
    title VARCHAR(100) NOT NULL COMMENT '报修标题',
    description TEXT NOT NULL COMMENT '问题描述',
    type VARCHAR(50) NOT NULL COMMENT '报修类型：water_electric-水电维修，decoration-装修维修，public_facility-公共设施，clean-保洁服务，security-安保服务，other-其他',
    priority VARCHAR(20) DEFAULT 'normal' COMMENT '优先级：low-低，normal-普通，high-高，urgent-紧急',
    expected_time DATETIME COMMENT '期望上门时间',
    images TEXT COMMENT '图片链接，JSON格式存储',
    
    -- 状态信息
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待处理，assigned-已分配，processing-处理中，completed-已完成，cancelled-已取消，rejected-已驳回',
    report_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报修时间',
    assign_time DATETIME COMMENT '分配时间',
    process_time DATETIME COMMENT '开始处理时间',
    complete_time DATETIME COMMENT '完成时间',
    
    -- 处理信息
    handler_name VARCHAR(50) COMMENT '处理人姓名',
    handler_phone VARCHAR(20) COMMENT '处理人电话',
    repair_type VARCHAR(20) COMMENT '维修类型：internal-内部维修，external-外部维修',
    cost DECIMAL(10,2) DEFAULT 0.00 COMMENT '维修费用',
    is_paid TINYINT(1) DEFAULT 0 COMMENT '是否已支付：0-未支付，1-已支付',
    payment_time DATETIME COMMENT '支付时间',
    payment_method VARCHAR(20) COMMENT '支付方式',
    notes TEXT COMMENT '处理备注',
    
    -- 评价信息
    evaluation_score INT COMMENT '评价星级(1-5)',
    evaluation_content TEXT COMMENT '评价内容',
    evaluation_time DATETIME COMMENT '评价时间',
    evaluation_images TEXT COMMENT '评价图片，JSON格式存储',
    
    -- 系统信息
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '是否删除：0-未删除，1-已删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 外键约束
    FOREIGN KEY (community_id) REFERENCES community_info(id),
    FOREIGN KEY (house_id) REFERENCES house_info(id),
    
    -- 索引
    UNIQUE INDEX idx_request_number (request_number),
    UNIQUE INDEX idx_request_code (request_code),
    INDEX idx_community (community_id),
    INDEX idx_house (house_id),
    INDEX idx_reporter (reporter_phone),
    INDEX idx_status (status),
    INDEX idx_report_time (report_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='报事报修表';

-- 插入示例数据
INSERT INTO maintenance_request (
    request_code, request_number, community_id, house_id, 
    reporter_name, reporter_phone, title, description, type, priority, 
    status, report_time, handler_name, handler_phone, notes
) VALUES
-- 待处理的报修
(
    'A1B2C3D4E5F6', 'MR202403010001', 1, 1,
    '张三', '13800138001', 
    '厨房水管漏水', '厨房水管漏水，地面积水严重，需要紧急维修', 
    'water_electric', 'high', 
    'pending', '2024-03-01 14:30:00',
    NULL, NULL, NULL
),
-- 处理中的报修
(
    'G7H8I9J0K1L2', 'MR202403010002', 1, 2,
    '李四', '13800138002',
    '客厅灯具维修', '客厅灯具不亮，可能是线路问题，需要检查线路',
    'water_electric', 'normal',
    'processing', '2024-03-01 09:15:00',
    '王师傅', '13900138001', '已安排电工上门检查'
),
-- 已完成的报修
(
    'M3N4O5P6Q7R8', 'MR202403010003', 2, 3,
    '王五', '13800138003',
    '门锁更换', '卧室门锁损坏，无法正常锁门，需要更换新锁',
    'decoration', 'normal',
    'completed', '2024-03-01 16:45:00',
    '李师傅', '13900138002', '已更换新门锁并测试正常'
);

-- 修改报事报修表，添加新字段
ALTER TABLE maintenance_request 
ADD COLUMN IF NOT EXISTS request_code VARCHAR(12) NOT NULL COMMENT '报修单号(12位随机字母数字组合)' AFTER id,
ADD UNIQUE INDEX idx_request_code (request_code);

-- 创建生成随机报修单号的函数
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generate_request_code() 
RETURNS VARCHAR(12)
DETERMINISTIC
BEGIN
    DECLARE chars VARCHAR(36);
    DECLARE result VARCHAR(12);
    DECLARE i INT;
    
    SET chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    SET result = '';
    SET i = 1;
    
    WHILE i <= 12 DO
        SET result = CONCAT(result, SUBSTRING(chars, FLOOR(1 + RAND() * 36), 1));
        SET i = i + 1;
    END WHILE;
    
    RETURN result;
END //
DELIMITER ;

-- 更新现有记录，生成报修单号并关联房屋信息
UPDATE maintenance_request m
INNER JOIN house_info h ON m.house_id = h.id
SET 
    m.request_code = (SELECT generate_request_code()),
    m.reporter_name = h.owner_name,
    m.reporter_phone = h.owner_phone,
    m.report_time = h.check_in_time
WHERE m.request_code IS NULL;

-- 修改插入触发器，自动生成报修单号
DELIMITER //
CREATE TRIGGER IF NOT EXISTS before_maintenance_insert
BEFORE INSERT ON maintenance_request
FOR EACH ROW
BEGIN
    DECLARE owner_info_name VARCHAR(50);
    DECLARE owner_info_phone VARCHAR(20);
    DECLARE check_in_date DATETIME;
    
    -- 获取房屋信息
    SELECT owner_name, owner_phone, check_in_time 
    INTO owner_info_name, owner_info_phone, check_in_date
    FROM house_info 
    WHERE id = NEW.house_id;
    
    -- 设置报修单号和房主信息
    SET NEW.request_code = (SELECT generate_request_code());
    SET NEW.reporter_name = IFNULL(NEW.reporter_name, owner_info_name);
    SET NEW.reporter_phone = IFNULL(NEW.reporter_phone, owner_info_phone);
    SET NEW.report_time = IFNULL(NEW.report_time, check_in_date);
END //
DELIMITER ;

-- 插入测试数据
INSERT INTO maintenance_request 
(house_id, community_id, title, description, type, priority, status)
VALUES 
(1, 1, '水管漏水', '厨房水管漏水需要维修', 'water_electric', 'high', 'pending'),
(2, 1, '门锁损坏', '大门门锁无法正常使用', 'decoration', 'normal', 'pending'),
(3, 1, '空调不制冷', '客厅空调不制冷需要检修', 'water_electric', 'normal', 'pending');

-- 查询示例
SELECT 
    m.request_code,
    m.title,
    m.description,
    m.reporter_name,
    m.reporter_phone,
    m.report_time,
    m.status,
    h.building_number,
    h.room_number
FROM maintenance_request m
INNER JOIN house_info h ON m.house_id = h.id
WHERE m.community_id = 1
ORDER BY m.report_time DESC;

-- 检查社区数据是否存在且有效
SELECT 
    c.id,
    c.community_name,
    c.address,
    c.is_enabled,
    c.is_deleted
FROM community_info c
WHERE c.is_deleted = 0 
AND c.is_enabled = 1;

CREATE TABLE repair_order (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL COMMENT '报修用户ID',
  title VARCHAR(100) NOT NULL COMMENT '报修标题',
  description TEXT NOT NULL COMMENT '报修描述',
  type ENUM('electric', 'plumbing', 'other') NOT NULL COMMENT '报修类型',
  location VARCHAR(200) COMMENT '报修位置',
  images TEXT COMMENT '图片路径，多个用逗号分隔',
  status ENUM('pending', 'processing', 'completed', 'rated') NOT NULL DEFAULT 'pending' COMMENT '报修状态',
  community_id INT NOT NULL COMMENT '所属社区ID',
  create_time DATETIME NOT NULL COMMENT '创建时间',
  update_time DATETIME COMMENT '更新时间',
  rating TINYINT COMMENT '评分，1-5',
  comment TEXT COMMENT '评价内容'
);  

-- 对现有没有request_code的记录生成随机码
UPDATE maintenance_request
SET request_code = (SELECT generate_request_code())  
WHERE request_code IS NULL OR request_code = '';

-- 修改request_code为NOT NULL，如果尚未设置
ALTER TABLE maintenance_request
MODIFY COLUMN request_code VARCHAR(12) NOT NULL COMMENT '报修随机码，用于无需登录查询报修进度';

-- 生成随机12位报修单号 - 个人区域
function generateRequestCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'PR'; // Personal Repair 前缀
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 生成随机12位报修单号 - 公共区域
function generatePublicRequestCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'PB'; // Public Repair 前缀
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

-- 向 maintenance_request 表添加 request_code 字段
ALTER TABLE maintenance_request
ADD COLUMN request_code VARCHAR(20) NOT NULL COMMENT '报修随机码，用于无需登录查询报修进度' AFTER request_number;

-- 添加唯一索引确保 request_code 唯一性
ALTER TABLE maintenance_request
ADD UNIQUE INDEX idx_request_code (request_code);

-- 更新现有数据（如果有的话），为每条记录生成一个唯一的 request_code
-- 这里使用一个简单的方法，实际中可能需要更复杂的逻辑
UPDATE maintenance_request 
SET request_code = CONCAT(
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1)
)
WHERE request_code IS NULL OR request_code = '';