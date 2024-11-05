export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }

    static badRequest(message: string) {
        return new ApiError(400, message);
    }

    static unauthorizedError() {
        return new ApiError(401, 'Пользователь не авторизован');
    }

    static blocked() {
        return new ApiError(403, 'Пользователь заблокирован');
    }

    static forbidden() {
        return new ApiError(403, 'Нет доступа');
    }

    static notFound(message: string) {
        return new ApiError(404, message);
    }

    static requestEntityTooLarge(message: string) {
        return new ApiError(413, message);
    }

    static tooManyRequests() {
        return new ApiError(429, 'Вы отправили слишком много запросов за последнее время. Пожалуйста, подождите некоторое время.');
    }
}