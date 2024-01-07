import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import useragent from "express-useragent";
import fileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";

import { CORS_OPTIONS } from "./consts/CORS_OPTIONS";
import { router } from "./routes/router";
import { errorMiddleWare } from "./middlewares/errorMiddleware";
import { sequelize } from "./db/connection";
import telegramService from "./services/telegramService";
import { STATIC_PATH } from "./consts/STATIC_PATH";
import permissionService from "./services/permissionService";
import swaggerDocument from "./swagger.json";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ ...CORS_OPTIONS }));
app.use(useragent.express());
app.set('trust proxy', true);
app.use(fileUpload());
app.use('/api', router);
app.use('/static', express.static(STATIC_PATH));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorMiddleWare);

const PORT = process.env.PORT || 8080;

const start = async () => {
    await sequelize.authenticate();

    if (process.env.SEQUELIZE_SYNC_MODE == 'alter') {
        await sequelize.sync({ alter: true });

        await permissionService.initPermissions();
    } else {
        await sequelize.sync();
    }

    telegramService.init();

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

start();

