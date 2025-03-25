const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/maintenance');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * 保存Base64图片
 * @param {string} base64String - Base64编码的图片
 * @returns {string} - 保存后的图片URL
 */
function saveBase64Image(base64String) {
    // 从Base64字符串中提取MIME类型和数据
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw new Error('无效的Base64图片格式');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 根据MIME类型确定文件扩展名
    let extension;
    switch (mimeType) {
        case 'image/jpeg':
            extension = '.jpg';
            break;
        case 'image/png':
            extension = '.png';
            break;
        case 'image/gif':
            extension = '.gif';
            break;
        default:
            extension = '.jpg';
    }

    // 生成唯一文件名
    const fileName = `${uuidv4()}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // 写入文件
    fs.writeFileSync(filePath, buffer);

    // 返回相对URL
    return `/uploads/maintenance/${fileName}`;
}

/**
 * 处理多张Base64图片上传
 * @param {Array} base64Images - Base64编码的图片数组
 * @returns {Array} - 保存后的图片URL数组
 */
function handleImagesUpload(base64Images) {
    if (!Array.isArray(base64Images) || base64Images.length === 0) {
        return [];
    }

    return base64Images.map(base64 => {
        try {
            return saveBase64Image(base64);
        } catch (error) {
            console.error('图片保存失败:', error);
            return null;
        }
    }).filter(url => url !== null);
}

module.exports = {
    saveBase64Image,
    handleImagesUpload
}; 