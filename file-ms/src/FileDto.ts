export class FileDto {
    success: number;
    file: { url: string, name: string, type: string, size: number, };

    constructor(url: string, name?: string, type?: string, size?: number) {
        this.success = 1;
        this.file = { url, name, type, size };
    }
}
