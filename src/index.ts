import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import useragent from "express-useragent";

import { CORS_OPTIONS } from "./consts/CORS_OPTIONS";
import { router } from "./routes/router";
import { errorMiddleWare } from "./middlewares/errorMiddleware";
import { sequelize } from "./db/connection";
import telegramService from "./services/telegramService";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ ...CORS_OPTIONS }));
app.use(useragent.express());
app.set('trust proxy', true);
app.use('/api', router);
app.use(errorMiddleWare);

const start = async () => {
    await sequelize.authenticate();

    // if (process.env.SEQUELIZE_SYNC_MODE == 'alter') {
    //     await sequelize.sync({ alter: true });
    // } else {
    //     await sequelize.sync();
    // }

    await sequelize.sync({ alter: true });

    telegramService.init();

    app.listen(8080, () => console.log('Server started'));
}

start();
