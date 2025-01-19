export class FileDto {
    success: number;
    file: {
        url: string;
        name: string;
        type: string;
        size: number;
        width: number;
        height: number;
    };

    constructor(
        url: string,
        name?: string,
        type?: string,
        size?: number,
        width?: number,
        height?: number
    ) {
        this.success = 1;
        this.file = { url, name, type, size, width, height };
    }
}
