
import * as fs from "fs";
import * as path from "path";
import { UPLOAD_COMMON, UploadType } from "src/common/common";

export function _copyFile(sourcePath: string, targetPath: string, times: number = 2) {
  if(!times) {
    return;
  }
  times--;
  if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
    fs.cp(sourcePath, targetPath, (err) => {
      if (err) {
        console.log(err)
        _copyFile(sourcePath, targetPath, times);
      }
    })
  }
}

export function generateChunksPath (type: UploadType, fileHash: string, chunksHash?: string) {
  const CHUNKS_DIR = path.join(UPLOAD_COMMON.upload_chunks_base_path, UPLOAD_COMMON.upload_type[type]);
  // chunk 文件夹路径
  const chunksDir = path.join(CHUNKS_DIR, fileHash);
  // chunk 文件路径
  let chunkPath = "";
  if (chunksHash) {
    chunkPath = path.join(chunksDir, chunksHash);
  }
  return {chunksDir, chunkPath};
}

export function generateSourcePath (type: UploadType, fileHash: string, extName?: string) {
  const FILE_DIR = path.join(UPLOAD_COMMON.upload_file_base_path, UPLOAD_COMMON.upload_type[type]);
  // 保存的 源文件夹路径
  const file_dir = path.join(FILE_DIR, fileHash);
  // 保存的 源文件路径
  let filePath = "";
  if (extName) {
    filePath = path.join(file_dir, `${fileHash}${extName}`);
  }
  return { file_dir, filePath }
}

export function generateRemotePath (type: UploadType, fileHash: string) {
  const  OUTPUT_DIR = path.join(UPLOAD_COMMON.upload_output_base_path, UPLOAD_COMMON.upload_type[type]);
  // 输出文件的 文件夹路径
  const outputDir = path.join(OUTPUT_DIR, fileHash);
  const fullFileName = "manifest.mpd"
  // 输出文件的 文件路径
  const outputsPath = path.join(outputDir, fullFileName)
  return {outputDir, outputsPath}
}
