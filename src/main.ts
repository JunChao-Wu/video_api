import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as bodyParse from 'body-parser';
import * as serveStatic from "serve-static";
import * as Path from "path"

import { chunkEncode } from "./middleware/chunkEncode.middleware";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors(); // 跨域
  app.use("/outputs", serveStatic(Path.join(__dirname, "../outputs")))
  app.use("/uploads", serveStatic(Path.join(__dirname, "../uploads")))
  app.use(bodyParse.json({limit: "5mb"}));
  app.use(bodyParse.urlencoded({limit: "5mb", extended: true}));
  // 偷懒直接全局中间件处理chunk字段的解码
  app.use(chunkEncode);
  await app.listen(3000)
}
bootstrap()
