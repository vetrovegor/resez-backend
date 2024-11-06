export class FileDto {
    success: number;
    file: { url: string };

    constructor(url: string) {
        this.success = 1;
        this.file = { url };
    }
}
