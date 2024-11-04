const path = require('node:path');
const fs = require('node:fs');

const STATIC_PATH = require('./consts');

const saveFile = async (subPath, file) => {
    const directory = path.join(STATIC_PATH, subPath);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const fileName = Date.now() + path.extname(file.filename);

    fs.writeFileSync(path.join(directory, fileName), file._buf);

    return `${subPath}/${fileName}`;
};

const deleteFile = fileName => {
    if (!fileName) {
        return;
    }

    const filePath = path.resolve(process.cwd(), 'uploads', fileName);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = { saveFile, deleteFile };
