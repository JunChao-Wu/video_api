interface UPLOAD_COMMON {
  readonly [key: string]: any
  UPLOAD_FILE_BASE_PATH: string;
  UPLOAD_CHUNKS_BASE_PATH: string
  UPLOAD_TYPE_MAP: {[key: string]: string};
}

// upload 相关的常量
export const UPLOAD_COMMON: UPLOAD_COMMON = {
  UPLOAD_FILE_BASE_PATH: "uploads/file",
  UPLOAD_CHUNKS_BASE_PATH: "uploads/chunks",
  UPLOAD_TYPE_MAP: {
    image: "image",
    video: "video"
  },
}