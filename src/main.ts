import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as bodyParse from 'body-parser';

import { chunkEncode } from "./middleware/chunkEncode.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors();
  app.use(bodyParse.json({limit: "5mb"}));
  app.use(bodyParse.urlencoded({limit: "5mb", extended: true}));
  // 偷懒直接全局中间件处理chunk字段的解码
  app.use(chunkEncode);
  await app.listen(3000)
}
bootstrap()
