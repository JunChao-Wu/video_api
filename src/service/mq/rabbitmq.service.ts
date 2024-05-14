import { Injectable } from '@nestjs/common';
import { RabbitMq } from 'src/utils/mq/_rabbitmq';
import { UploadService } from '../upload.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class RabbitmqService extends RabbitMq {
  private uploadService: UploadService
  constructor(
    private moduleRef: ModuleRef
  ) {
    super()
  }

  onModuleInit() {
    this.uploadService = this.moduleRef.get(UploadService);
  }

  productMerge (msg: any) {
    this.publish("q1_direct_upload", msg);
  }

  async mergeHandler(msg: any) {
    await this.uploadService.mergerFileChunks({
      fileHash: msg.fileHash,
      fileName: msg.fileName,
      extName: msg.extName,
      filePath: msg.filePath,
      chunksDir: msg.chunksDir,
      chunkSize: msg.chunkSize,
      userId: msg.userId,
      fileType: msg.fileType,
      seriesId: msg.seriesId,
      sequence: msg.sequence,
      timezone: msg.timezone,
    }, msg.excute)
    return true;
  }

}