import { ValidationError } from 'express-validator';

export class ApiError extends Error {
    status: number;
    errors: ValidationError[];

    constructor(status: number, message: string, errors: ValidationError[] = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static badRequest(message: string) {
        return new ApiError(400, message);
    }

    static validationError(errors: ValidationError[] = []) {
        return new ApiError(400, 'Ошибка валидации', errors);
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

    static tooManyRequests() {
        return new ApiError(429, 'Вы отправили слишком много запросов за последнее время. Пожалуйста, подождите некоторое время.');
    }
}