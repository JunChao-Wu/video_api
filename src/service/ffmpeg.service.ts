import { Injectable } from '@nestjs/common';
import * as fs from "fs";
import * as Path from "path";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegStatic from "ffmpeg-static";

import { UPLOAD_COMMON } from "../common/common";
import { CreateVideoInfoType, VideoService } from "./db_video/video.service";
import { generateRemotePath } from 'src/utils/fsUtil/FsUtil';
import { Locker } from 'src/utils/lock/Locker';

ffmpeg.setFfmpegPath(ffmpegStatic + "");

const scaleOptions = [
  // "scale=640:320",
  // "scale=854:480",
  // "scale=1280:720",
  "scale=1920:1080",
];
const videoCodec = "libx264";
const x264Options = "keyint=24:min-keyint=24:no-scenecut";
const videoBitrates = ["500k", "1000k"];

@Injectable()
export class FfmpegService {
  constructor(
    private videoService: VideoService
  ) {}

  async transformDash(config: ConfigType, requestId: string): Promise<void>{
    if (!config.userId) {
      return;
    }
    const lock = new Locker({
      key: "transform",
      requestId
    });
    await lock.lock(60 * 30);

    const { outputDir, outputsPath } = generateRemotePath("video", config.fileHash);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    // return
    // 特殊处理mkv格式的字幕，直接烧录
    const outputOptions = Path.extname(config.path) === ".mkv"
                          ? ["-b:v", videoBitrates[1], "-vf", `subtitles=${config.path}`]
                          : ["-b:v", videoBitrates[1]];

    ffmpeg()
      .input(config.path)
      .videoFilters(scaleOptions)
      .videoCodec(videoCodec)
      .addOptions("-x264opts", x264Options)
      // .outputOptions("-b:v", videoBitrates[1], "-vf", `subtitles=${config.path}`, "-vframes", "500")
      .outputOptions(...outputOptions)
      .format("dash")
      .output(outputsPath)
      .on('start', () => {
        console.log('Starting DASH transcoding...');
      })
      .on('progress', (progress) => {
        console.log(`Progress: ${progress.percent.toFixed(2)}%`);
      })
      .on('error', (err: Error, stdout: string, stderr: string) => {
        console.error('Error:', err.message);
        console.error('FFmpeg stdout:', stdout);
        console.error('FFmpeg stderr:', stderr);
      })
      .on('end', async () => {
        console.log('DASH transcoding completed.');
        // 结束时将所有.m4s文件移动到目标文件夹
        mvOutputChunk(outputDir);
        const videoConfig: CreateVideoInfoType = {
          userId: config.userId,
        };
        videoConfig.remotePath = outputsPath;
        videoConfig.videoId = config.videoId;
        videoConfig.status = UPLOAD_COMMON.video_status.success;
        await this.videoService.updateOne(videoConfig);
        await lock.unLock();
      })
      .run();

  }

  getFileInfo(path: string): Promise<fileInfo> {
    return new Promise((resolve) => {
      const fileInfo: fileInfo = {
        video: {},
        audio: {},
        subtitle: {},
      }
      ffmpeg.ffprobe(path, (err, data) => {
        if (err) {
          console.log(err);
        }
        // 基本信息
        fileInfo.duration = data.format.duration;
        fileInfo.size = data.format.size;
        fileInfo.bit_rate = data.format.bit_rate;
        // video相关信息
        fileInfo.video.width = data.streams[0].width;
        fileInfo.video.height = data.streams[0].height;
        fileInfo.video.codec_name = data.streams[0].codec_name;
        fileInfo.video.codec_long_name = data.streams[0].codec_long_name;
        fileInfo.video.display_aspect_ratio= data.streams[0].display_aspect_ratio;
        // audio相关信息
        fileInfo.audio.codec_name = data.streams[1]?.codec_name;
        fileInfo.audio.sample_rate = data.streams[1]?.sample_rate;
        // subtitle相关
        fileInfo.subtitle.codec_name = data.streams[2]?.codec_name;
        resolve(fileInfo)
      });
    })
  }

}



async function mvOutputChunk(targetPath: string): Promise<void> {
  const sourcePath = Path.join("");
  fs.readdirSync(sourcePath).map((fileName) => {
    if (Path.extname(fileName).toLocaleLowerCase() !== ".m4s") {
      return;
    }
    fs.renameSync(Path.join(sourcePath, fileName), Path.join(targetPath, fileName));
  })
}

type fileInfo = {
  duration?: number;
  size?: number;
  bit_rate?: number;
  video: {
    width?: number | undefined;
    height?: number | undefined;
    codec_name?: string | undefined;  // 编码格式
    codec_long_name?: string | undefined;  // 编码格式
    display_aspect_ratio?: string | undefined; // 宽高比
  },
  audio: {
    codec_name?: string | undefined;
    sample_rate?: number | undefined;
  }
  subtitle: {
    codec_name?: string | undefined;
  }
}

type ConfigType = {
  videoId: number,
  path: string,
  fileHash: string,
  userId: number
}