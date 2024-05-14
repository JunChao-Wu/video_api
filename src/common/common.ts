import { establish } from "src/config/establish";

establish();// 挂载全局内置模块的额外方法

export const BASE_COMMON = {
  timezone: {
    "8": "+08:00",
  },
  rabbitmq: {
    hostName: process.env.RABBITMQ_HOST,
    username: process.env.RABBITMQ_USER_NAME,
    password: process.env.RABBITMQ_PASSWORD,
    queues: {
      merge: {
        name: "MQ_FILE_MERGE",
        queue: "upload.merge",
      }
    },
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || "6380",
    userName: process.env.REDIS_USER_NAME || "",
    password: process.env.REDIS_PASSWORD || "",
    db: process.env.REDIS_DB_INDEX || "",
  }
} as const;

/**
 * upload
 */
export const UPLOAD_COMMON = {
  upload_file_base_path: "uploads/file",
  upload_chunks_base_path: "uploads/chunks",
  upload_output_base_path: "outputs/",
  upload_type: {
    image: "image",
    video: "video"
  },
  video_status: {
    pending: 0,
    pass_pending: 2,
    success: 1,
    reject: 11,
  }
} as const;

const video_status = Object.values(UPLOAD_COMMON.video_status);
export type VideoStatusType = typeof video_status[number];

const upload_type = Object.values(UPLOAD_COMMON.upload_type);
export type UploadType = typeof upload_type[number];


/**
 * token
 */
export const tokenCommon = {
  sercetKey: process.env.TOKEN_SECRET_KEY || "",
  expiredTime: 60 * 5, // 秒
} as const;

/**
 * redis
 */
export const REDIS_KEY_COMMON = {
  cacheExpireTime: 7 * 24 * 60 * 60, // 秒
  cacheName: {
    seriesList: "seriesList",
  }
} as const;

/**
 * series
 */
export const SERIES_COMMON = {
  keyReflect: {
    "series_id": "seriesId",
    "series_name": "seriesName",
    "series_alias": "alias",
    "series_introduction": "introduction",
    "series_original_worker": "originalWorker",
    "series_premiere_date": "premiereDate",
    "series_production_company": "company",
    "series_region": "region",
    "series_status": "status",
    "series_cover_path": "coverPath",
    "series_tags": "tags",
    "series_type": "type",
    "created_user_id": "createdUserId",
    "updated_user_id": "updatedUserId",
    "created_timezone": "createdTimezone",
    "updated_timezone": "updatedTimezone",
    "created_time": "createdTime",
    "updated_time": "updatedTime",
  },
  statusMap: {
    "0": "未开播",
    "1": "连载",
    "2": "已完结",
  },
  seriesTypeMap: {
    "0": "unkown",
    "1": "TV",
    "2": "OVA",
    "3": "Film",
  }
} as const;

export type SeriesKeyReflect = keyof typeof SERIES_COMMON.keyReflect;

/**
 * video
 */
export const VIDEOS_COMMON = {
  keyReflect: {
    "id": "id",
    "video_id": "videoId",
    "video_series_id": "seriesId",
    "video_title": "title",
    "video_source_path": "sourcePath",
    "video_remote_path": "remotePath",
    "video_hash": "videoHash",
    "video_aspect_ratio": "aspectRatio",
    "video_duration": "duration",
    "video_size": "size",
    "video_bitrate": "bitrate",
    "video_ext": "extName",
    "video_sequence": "sequence",
    "status": "status",
    "created_user_id": "createdUserId",
    "updated_user_id": "updatedUserId",
    "created_timezone": "createdTimezone",
    "updated_timezone": "updatedTimezone",
    "created_time": "createdTime",
    "updated_time": "updatedTime",
  },
  status: {
    pending: 0,
    pass_pending: 2,
    success: 1,
    reject: 11,
  }
} as const;
export type VideosKeyReflect = keyof typeof VIDEOS_COMMON.keyReflect;
