"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
// Описание аутентификационного плагина
const authPlugin = (0, fastify_plugin_1.default)(async (fastify, opts) => {
    // Регистрация плагина JWT с секретом из переменной окружения
    fastify.register(jwt_1.default, {
        secret: process.env.JWT_ACCESS_SECRET || 'your-default-secret'
    });
    // Добавляем метод authenticate
    fastify.decorate('authenticate', async function (request, reply) {
        try {
            // Верификация JWT токена в запросе
            await request.jwtVerify();
        }
        catch (err) {
            reply.send(err);
        }
    });
});
// Экспортируем плагин для использования
exports.default = authPlugin;
