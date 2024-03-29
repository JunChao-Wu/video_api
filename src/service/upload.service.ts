import { Injectable } from '@nestjs/common';
import * as fs from "fs";
import * as path from "path";


@Injectable()
export class UploadService {

  async mergerFileChunks(config: { filePath: string, chunksDir: string, chunkSize: number, }, excute: boolean): Promise<void> {
    if (!excute) {
      return;
    }
    const { filePath, chunkSize, chunksDir } = config;

    const chunksPaths = fs.readdirSync(chunksDir);
    chunksPaths.sort((a: string, b: string) => {
      return (a.split("-")[1] as unknown as number) - (b.split("-")[1] as unknown as number);
    })
    console.log("🚀 ~ UploadService ~ mergerFileChunks ~ chunksPaths:", chunksPaths)
    // 用promise池会乱序导致合并的文件错误, 看是否有解决办法

    // let index = 0;
    // const max = 50;
    // const task_pool: Promise<void>[] = [];
    // while (index < chunksPaths.length) {
    //   const chunkName = chunksPaths[index];
    //   const task = this.pipeStream(
    //     path.resolve(chunksDir, chunkName),
    //     fs.createWriteStream(filePath, {
    //       start: index * chunkSize,
    //     })
    //   );
    //   task.then(() => {
    //     task_pool.splice(task_pool.findIndex((item: any) => item === task));
    //   });
    //   task_pool.push(task);
    //   if (task_pool.length === max) {
    //     await Promise.race(task_pool);
    //   }
    //   index ++ 
    // }
    // await Promise.all(task_pool);

    const list = chunksPaths.map((chunkName, index) => {
      return this.pipeStream(
        path.resolve(chunksDir, chunkName),
        fs.createWriteStream(filePath, {
          start: index * chunkSize,
        })
      )
    });
    await Promise.all(list);

    fs.rmdir(chunksDir, (err) => {
      if (err) throw err;
    });
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
