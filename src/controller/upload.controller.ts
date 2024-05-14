import * as fs from 'fs';
import { Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from "src/guards/auth.guard";

import * as uploadRole_d from "../validate/uploadRole/uploadRole_d";
import { UploadRole } from "../validate/uploadRole/UploadRole";
import { Validate } from 'src/decorator/validate.decorator';
import { BASE_ROUTE, API } from '../routes/Routes'
import { UPLOAD_COMMON } from "../common/common";
import { BaseController } from './impl/base.controller';

import { UploadService } from "../service/upload.service";
import { FfmpegService } from "../service/ffmpeg.service";
import { VideoService } from "../service/db_video/video.service";
import { generateChunksPath, generateSourcePath } from "src/utils/fsUtil/FsUtil";
import { RedisService } from 'src/service/redis/redis.service';
import { RabbitmqService } from 'src/service/mq/rabbitmq.service';


@Controller(BASE_ROUTE.upload)
@UseGuards(AuthGuard)
export class UploadController extends BaseController {
  constructor(
    private uploadService: UploadService,
    private ffmpegService: FfmpegService,
    private videoService: VideoService,
    private redisService: RedisService,
    private rabbitmqService: RabbitmqService,
  ) {
    super()
  }

  @Post(API.upload.upload_post)
  async upload(@Validate(UploadRole.upload) reqClone: uploadRole_d.upload): Promise<object> {
    const { chunkHash, chunk, fileHash, type } = reqClone;
    let result = this.makeBaseResult();
    try {
      // 写入文件
      const {chunksDir, chunkPath} = generateChunksPath( type, fileHash, chunkHash,);
      if (!fs.existsSync(chunksDir)) {
        // 建文件路径
        fs.mkdirSync(chunksDir, { recursive: true });
      }
      fs.writeFileSync(chunkPath, new Uint8Array(chunk));
      result = this.makeSuccessResult({succ: true}, "upload");

    } catch (error) {
      result = this.makeErrorResult(error, "upload");
    }
    return result
  }

  @Post(API.upload.merge_post)
  async merge(@Validate(UploadRole.merge) reqClone: uploadRole_d.merge): Promise<object> {
    const { fileName, extName, fileHash, chunkSize, type, user, sequence, seriesId } = reqClone;
    let result = this.makeBaseResult();
    try {
      const { file_dir, filePath } = generateSourcePath(type, fileHash, extName);
      // excute 控制合并执行
      let excute = true;
      if (!fs.existsSync(file_dir)) {
        fs.mkdirSync(file_dir, { recursive: true });
      }
      if (fs.existsSync(filePath)) {
        excute = false;
      }
      const { chunksDir } = generateChunksPath( type, fileHash)
      if (!fs.existsSync(chunksDir)) {
        excute = false;
      }

      this.rabbitmqService.productMerge({
        fileHash,
        fileName,
        extName,
        filePath,
        chunksDir,
        chunkSize,
        userId: user?.id,
        fileType: type,
        seriesId: seriesId,
        sequence: sequence,
        timezone: user?.timezone,
        excute,
      });


      // this.uploadService.mergerFileChunks({
      //   fileHash,
      //   fileName,
      //   extName,
      //   filePath,
      //   chunksDir,
      //   chunkSize,
      //   userId: user?.id as number,
      //   fileType: type,
      //   seriesId: seriesId,
      //   sequence: sequence,
      //   timezone: user?.timezone,
      // }, excute);
      result = this.makeSuccessResult({succ: true, data: {filePath}}, "合并")
    } catch (error) {
      result = this.makeErrorResult(error, "merge")
    }
    return result;
  }

  @Post(API.upload.vertify_post)
  async vertify(@Validate(UploadRole.vertify) reqClone: uploadRole_d.vertify): Promise<object> {
    const { type, fileHash, seriesId, sequence } = reqClone;
    let result = this.makeBaseResult();
    try {
      let uploaded = true;
      let existed = false;
      let chunksList: string[] = [];
      const { file_dir } = generateSourcePath(type, fileHash);
      if (!fs.existsSync(file_dir)) {
        uploaded = false;
        const { chunksDir } = generateChunksPath(type, fileHash)
        if (fs.existsSync(chunksDir)) {
          chunksList = fs.readdirSync(chunksDir);
        }
      }
      if (seriesId && sequence) {
        const isExisted = await this.uploadService.checkSeriesVideoExist({
          seriesId: seriesId,
          sequence: sequence,
        });
        if (!isExisted) {
          // 有文件但数据库还没记录就再请求合并生成
          existed = true;
        }
      }
      result = this.makeSuccessResult({succ: true, data: {
        uploaded,
        existed,
        chunksList
      }}, "verify");
    } catch (error) {
      result = this.makeErrorResult(error, "verify");
    }

    return result;
  }

  @Post(API.upload.transform_post)
  async transform(@Validate(UploadRole.transform) reqClone: uploadRole_d.transform): Promise<object> {
    const { videoId, user, pass ,requestId } = reqClone;
    let result = this.makeBaseResult();
    try {
      const status = pass ? UPLOAD_COMMON.video_status.pass_pending : UPLOAD_COMMON.video_status.reject;
      await this.videoService.updateOne({
        videoId: videoId,
        status: status,
        userId: user?.id as number,
        timezone: user?.timezone,
      })
      if (pass) {
        const fileInfo = await this.videoService.findById(videoId);
        const path = fileInfo && fileInfo?.video_source_path &&  fileInfo?.video_source_path.replace(/\\/g, "/" );
        const fileHash = fileInfo?.video_hash;
        if (fileInfo && path && fileHash) {
          this.ffmpegService.transformDash({videoId,
            path,
            fileHash,
            userId: user?.id as number
          }, requestId);
        } else {
          throw new Error("文件信息出错");
        }
      }
      result = this.makeSuccessResult({succ: true, data: {}}, "transform");
    } catch (error) {
      result = this.makeErrorResult(error, "transform");
    }
    return result;
  }
}