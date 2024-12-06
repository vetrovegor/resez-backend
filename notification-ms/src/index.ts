import { app } from './app';
import config from './config';

app.listen(config.port).on('listening', () =>
    console.log(`Server started at port: ${config.port}`)
);