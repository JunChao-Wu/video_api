import { Injectable } from '@nestjs/common';
import * as fs from "fs";
import * as Path from "path";

import { CreateVideoInfoType, VideoService } from "../service/db_video/video.service";
import { FfmpegService } from "../service/ffmpeg.service";


@Injectable()
export class UploadService {
  constructor(
    private videoService: VideoService,
    private ffmpegService: FfmpegService,
  ) {}

  async checkSeriesVideoExist (config: {seriesId: number, sequence: number}) {
    const hasUploaded = await this.videoService.findBySeriesIdAndSequence({
      seriesId: config.seriesId,
      sequence: config.sequence,
    })
    return hasUploaded && hasUploaded > 0 ? true : false;
  }

  async mergerFileChunks(config: ConfigType, excute: boolean): Promise<void> {
    if (!config.userId) {
      return;
    }
    const { filePath, chunkSize, chunksDir } = config;
    if (excute) {
      const chunksPaths = fs.readdirSync(chunksDir);
      chunksPaths.sort((a: string, b: string) => {
        return (a.split("-")[1] as unknown as number) - (b.split("-")[1] as unknown as number);
      })
  
      const list = chunksPaths.map((chunkName, index) => {
        return this.pipeStream(
          Path.resolve(chunksDir, chunkName),
          fs.createWriteStream(filePath, {
            start: index * chunkSize,
          })
        )
      });
      await Promise.all(list);
    }

    if (fs.existsSync(chunksDir)) {
      fs.rm(chunksDir, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }

    if (config.fileType === 'video') {
      const isExisted = await this.checkSeriesVideoExist({
        seriesId: config.seriesId,
        sequence: config.sequence,
      })
      if (isExisted) {
        throw new Error("已有相同序列")
      }
      const videoInfo: CreateVideoInfoType = {
        userId: config.userId,
      };
      videoInfo.videoHash = config.fileHash;
      videoInfo.seriesId = config.seriesId;
      videoInfo.sequence = config.sequence;
      videoInfo.sourcePath = config.filePath;
      videoInfo.title = config.fileName;
      videoInfo.extName = config.extName;
      const info = await this.ffmpegService.getFileInfo(videoInfo.sourcePath);
      videoInfo.size = info.size;
      videoInfo.bitrate = info.bit_rate;
      videoInfo.duration =  Math.ceil(info.duration as number);
      videoInfo.aspectRatio =  info.video.display_aspect_ratio;
      await this.videoService.createOne(videoInfo);
    }
    if (config.fileType === 'image') {

    }
    return;
  }

  private async pipeStream (path: string, writeStream: fs.WriteStream): Promise<void> {
    return new Promise((resolve) => {
      const readStream = fs.createReadStream(path);
      readStream.on("end", async () => {
        fs.unlinkSync(path);
        resolve();
      });
      readStream.pipe(writeStream);
    });
  }
}

type ConfigType = {
  fileHash: string,
  fileName: string,
  extName: string,
  filePath: string,
  chunksDir: string,
  chunkSize: number,
  userId: number,
  fileType: string,
  seriesId: number,
  sequence: number,
  timezone?: number,
}