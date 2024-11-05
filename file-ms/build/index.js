"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const static_1 = __importDefault(require("@fastify/static"));
require("dotenv/config");
const routes_1 = __importDefault(require("./routes"));
const authenticate_1 = __importDefault(require("./authenticate"));
const consts_1 = __importDefault(require("./consts"));
// const dbconnector = require('./db')
// fastify.register(dbconnector)
const fastify = (0, fastify_1.default)({
    logger: true,
    ajv: { plugins: [require('@fastify/multipart').ajvFilePlugin] }
});
fastify.register(multipart_1.default, {
    attachFieldsToBody: true
});
fastify.register(static_1.default, {
    root: consts_1.default,
    prefix: '/api/static/'
});
fastify.register(authenticate_1.default);
fastify.register(routes_1.default, { prefix: '/api' });
const PORT = Number(process.env.PORT) || 8080;
function start() {
    try {
        fastify.listen({ port: PORT }, () => console.log(`Server started at port ${PORT}`));
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();
