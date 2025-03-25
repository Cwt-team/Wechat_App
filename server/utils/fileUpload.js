const fs = require('fs');
const path = require('path');
const multer = require('multer');

/**
 * 处理Base64编码的图片上传
 * @param {Array} images - 包含Base64编码图片的数组
 * @returns {Array} - 处理后的图片URL数组
 */
function handleImagesUpload(images) {
    const uploadDir = path.join(__dirname, '../uploads/repair');

    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 处理每个图片
    const imageUrls = [];

    images.forEach((base64Image, index) => {
        // 跳过非Base64编码的图片
        if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:image')) {
            return;
        }

        // 从Base64提取图片数据和类型
        const matches = base64Image.match(/^data:image\/([A-Za-z]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return;
        }

        const imageType = matches[1];
        const imageData = Buffer.from(matches[2], 'base64');

        // 生成唯一文件名
        const fileName = `img_${Date.now()}_${index}.${imageType}`;
        const filePath = path.join(uploadDir, fileName);

        // 保存文件
        fs.writeFileSync(filePath, imageData);

        // 添加到URL列表
        const relativeUrl = `uploads/repair/${fileName}`;
        imageUrls.push(relativeUrl);
    });

    return imageUrls;
}

/**
 * 配置Multer上传
 */
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

module.exports = {
    handleImagesUpload,
    upload
}; 