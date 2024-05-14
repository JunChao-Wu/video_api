import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
// others
// import { BASE_COMMON } from './common/common';
// middleware
import { DataInfoMiddleware } from "./middleware/dataInfo.middleware";
// // imports
import { ScheduleModule } from '@nestjs/schedule';
// controller
import { UploadController } from "./controller/upload.controller";
import { UserController } from "./controller/user.controller";
import { ExamineController } from "./controller/examine.controller";
import { SeriesController } from "./controller/series.controller";
import { AuthController } from './controller/auth.controller';

// service
import { VideoService } from "./service/db_video/video.service";
import { RedisService } from "./service/redis/redis.service";
import { SeriesService } from "./service/db_video/series.service";
import { UploadService } from "./service/upload.service";
import { FfmpegService } from "./service/ffmpeg.service";
import { UsersService } from "./service/db_video/users.service";
import { TokenService } from "./service/token.service";
import { RabbitmqService } from './service/mq/rabbitmq.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [UploadController, UserController, ExamineController
    , SeriesController, AuthController,
  ],
  providers: [UploadService, FfmpegService, UsersService, VideoService, RedisService
    ,TokenService, SeriesService, RabbitmqService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DataInfoMiddleware).forRoutes("*")
    // consumer.apply(dataInfo).forRoutes("*")
  }
}
