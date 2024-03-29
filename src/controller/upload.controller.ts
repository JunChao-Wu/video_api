import * as path from "path";
import * as fs from 'fs';
import { Controller, Post } from '@nestjs/common'

import * as uploadRole_d from "../validate/uploadRole/uploadRole_d";
import { UploadRole } from "../validate/uploadRole/UploadRole";
import { Validate } from 'src/decorator/validate.decorator';
import { BASE_ROUTE, API } from '../routes/Routes'
import { UPLOAD_COMMON } from "../common/common";
import { UploadService } from "../service/upload.service";


@Controller(BASE_ROUTE.upload)
export class UploadController {
  constructor(
    private uploadService: UploadService
  ) {}

  @Post(API.upload.upload_post)
  upload(@Validate(UploadRole.upload) reqClone: uploadRole_d.upload): object {
    const { chunkHash, chunk, fileHash, type } = reqClone;
    console.log("🚀 ~ UploadController ~ upload ~ reqClone:", reqClone)
    const CHUNKS_DIR = path.resolve(UPLOAD_COMMON.UPLOAD_CHUNKS_BASE_PATH, UPLOAD_COMMON.UPLOAD_TYPE_MAP[type]) ;
    // 写入文件
    const chunksDir = path.resolve(CHUNKS_DIR, fileHash);
    if (!fs.existsSync(chunksDir)) {
      // 建文件路径
      fs.mkdirSync(chunksDir, { recursive: true });
    }

  
    // fs.writeFileSync(`${chunksDir}/${chunkHash}`, chunk);
    fs.writeFileSync(`${chunksDir}/${chunkHash}`, new Uint8Array(chunk));
    return {
      success: true,
      data: "上传成功",
      code: 200,
    }
  }

  @Post(API.upload.merge_post)
  merge(@Validate(UploadRole.merge) reqClone: uploadRole_d.merge): object {
    const { fileName, fileHash, chunkSize, type } = reqClone;
    // excute 控制合并执行
    let excute = true;
    const FILE_DIR = path.resolve(UPLOAD_COMMON.UPLOAD_FILE_BASE_PATH, UPLOAD_COMMON.UPLOAD_TYPE_MAP[type]);
    if (!fs.existsSync(FILE_DIR)) {
      fs.mkdirSync(FILE_DIR, { recursive: true });
    }
    const filePath = path.resolve(FILE_DIR, `${fileHash}${fileName.slice(fileName.lastIndexOf("."), fileName.length)}`);
    if (fs.existsSync(filePath)) {
      excute = false;
    }
    const chunksDir = path.resolve(UPLOAD_COMMON.UPLOAD_CHUNKS_BASE_PATH, UPLOAD_COMMON.UPLOAD_TYPE_MAP[type], fileHash);
    if (!fs.existsSync(chunksDir)) {
      excute = false;
    }

    this.uploadService.mergerFileChunks({
      filePath,
      chunksDir,
      chunkSize,
    }, excute);
    return {
      success: true,
      data: "合并成功",
      code: 200,
    }
  }
}
