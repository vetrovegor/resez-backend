const saveFile = async file => {
    try {
        const fileName = Date.now() + path.extname(file.originalname);

        const staticPath = path.resolve(process.cwd(), 'static');

        if (!fs.existsSync(staticPath)) {
            fs.mkdirSync(staticPath, { recursive: true });
        }

        fs.writeFileSync(path.join(staticPath, fileName), file.buffer);

        return fileName;
    } catch (e) {
        console.log('Произошла ошибка при записи файла:', e);
    }
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
