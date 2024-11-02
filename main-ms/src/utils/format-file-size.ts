export const formatFileSize = (fileSizeInBytes: number) => {
    if (fileSizeInBytes < 1024) {
        return `${fileSizeInBytes} B`;
    } else if (fileSizeInBytes < 1024 ** 2) {
        return `${(fileSizeInBytes / 1024).toFixed(2)} KB`;
    } else if (fileSizeInBytes < 1024 ** 3) {
        return `${(fileSizeInBytes / 1024 ** 2).toFixed(2)} MB`;
    } else {
        return `${(fileSizeInBytes / 1024 ** 3).toFixed(2)} GB`;
    }
};
